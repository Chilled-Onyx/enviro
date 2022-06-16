import type { IncomingMessage, ServerResponse, IncomingHttpHeaders } from 'http';
import type { Socket } from 'net';
import type { EventEmitter } from 'events';

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

declare namespace Enviro {
  type NodeSocket = Socket;
  type KeyValueStore = {[key: string | symbol | number]: unknown};
  type NameAndOptionsStore = {name: string, options: KeyValueStore};
  type ErrorMessageGenerator = (...args) => string;

  type Config = {
    http: Enviro.REST.Config;
    storage: Enviro.NameAndOptionsStore;
    plugins: Enviro.NameAndOptionsStore[];
    log: {
      level: number;
      formatted: boolean;
    }
    startup: {
      display: {
        banner: boolean;
        config: boolean;
      };
    };
  };

  type ConfigPrebuild = Pick<Enviro.Config, Exclude<keyof Enviro.Config, 'plugins'>> & {
    storage: string | Enviro.Config['storage'];
    plugins: (string | Partial<Enviro.NameAndOptionsStore>)[];
    logger: string | Enviro.Config['logger'];
  };

  interface ApplicationStatic {
    new(config?: DeepPartial<Enviro.ConfigPrebuild>): Enviro.Application;

    buildConfigObject(config: DeepPartial<Enviro.ConfigPrebuild>): Enviro.Config;
  }

  class Application extends EventEmitter {
    public config: Enviro.Config;
    public logger: Enviro.Logging.Logger;
    public pluginManager: Enviro.Plugins.Manager;
    public rest: Enviro.REST.Server;
    public storage: Enviro.Storage;
  }

  type StorageAbstract = {
    new(config: Enviro.KeyValueStore, enviro: Enviro.Application): Storage;
  };

  class Storage {
    public config: Enviro.KeyValueStore;
    public enviro: Enviro.Application;

    public delete(settingsName: string): Promise<void>;
    public read(settingsName: string): Promise<Enviro.KeyValueStore>;
    public write(settingsName: string, settings: Enviro.KeyValueStore): Promise<void>;
  }

  namespace Logging {
    type LogLine = {
      level:     number,
      time:      string,
      group:     string,
      message:   string,
      pid:       number,
      hostname:  string
      extraData: Enviro.KeyValueStore
    };

    type LogOutputFunction = (outputText: string) => boolean;

    interface Logger {
      public logLevel: number;
      public outputFunction: Enviro.Logging.LogOutputFunction;

      public getLogLine(partialLogLine: Partial<Enviro.Logging.LogLine>): Enviro.Logging.LogLine;
      public async log(logLine: string | Partial<Enviro.Logging.LogLine>): Promise<this>;
    }
  }

  namespace Plugins {
    type PluginOptions = {
      enviro: Enviro.Application;
    } & Enviro.KeyValueStore;

    class Plugin {
      public enviro: Enviro.Application;
      public options: Enviro.KeyValueStore;

      constructor(pluginOptions: PluginOptions);

      authenticateRequest?(request: Enviro.REST.Request): Promise<boolean>;
      processSettings?(settings: Enviro.KeyValueStore): Promise<Enviro.KeyValueStore>;
      route?(request: Enviro.REST.Request, response: Enviro.REST.response): Promise<Enviro.REST.Route>;
    }

    interface ManagerStatic {
      new(): Enviro.Plugins.Manager;
    }

    class Manager implements Enviro.Plugins.Plugin {
      public addPlugin(plugin: Enviro.Plugins.Plugin): this;
      public authenticateRequest(request: Enviro.REST.Request): Promise<boolean>;
      public getPlugins(withMethod?: keyof Enviro.Plugins.Plugin | null): Enviro.Plugins.Plugin[];
      public processSettings(settings: Enviro.KeyValueStore): Promise<Enviro.KeyValueStore>;
      public resetPlugins(): this;
      public route(request: Enviro.REST.Request, response: Enviro.REST.Response): Promise<boolean>;
    }
  }

  namespace REST {
    type Config = {
      port: number;
      maxBodySize: number;
      settingsSectionSeparator: string;
      certificate: string;
      key: string;
    };

    type HTTPConstants = {
      CONTENT_TYPE: {[type: string]: string};
      METHOD: {[method: string]: string};
      STATUS: {[name: string]: number};
    };

    interface ServerStatic {
      new(config: Partial<Enviro.REST.Config>, enviro: Enviro.Application): Enviro.REST.Server;

      buildConfigObject(config: Partial<Enviro.REST.Config>): Enviro.REST.Config;
    }

    class Server {
      public readonly config: Enviro.REST.Config;
      public readonly enviro: Enviro.Application;

      constructor(config: Partial<Enviro.REST.Config>, enviro: Enviro.Application);

      public start(): this;
      public stop(): this;
    }

    type RequestBodyContainer     = { raw: string; parsed: KeyValueStore; };
    type RequestClientInfo        = Enviro.KeyValueStore & {
      headers: IncomingHttpHeaders;
      ip: string;
      method: keyof Enviro.REST.HTTPConstants.METHOD;
      url: string;
      userAgent: string;
    };
    type RequestErrorContainer    = { code: number; message: string; };
    type RequestSettingsContainer = { name: string; section: string; raw: boolean; };

    interface RequestStatic {
      public readonly ERROR_INVALID_ACCEPT_TYPE: Enviro.ErrorMessageGenerator;
      public readonly ERROR_INVALID_CONTENT_SYNTAX: Enviro.ErrorMessageGenerator;
      public readonly ERROR_INVALID_CONTENT_TYPE: Enviro.ErrorMessageGenerator;
      public readonly ERROR_OVER_LIMIT_BODY_LENGTH: Enviro.ErrorMessageGenerator;

      public readonly VALID_ACCEPT_TYPES: string[];

      public MAX_BODY_SIZE: number;
      public SECTION_SEPARATOR: string;

      public logger: Enviro.Logging.Logger;

      new(socket: Enviro.NodeSocket): Enviro.REST.Request;
    }

    class Request extends IncomingMessage {
      public body: Enviro.REST.RequestBodyContainer;
      public error: Enviro.REST.RequestErrorContainer;
      public readonly id: string;
      public method: string;
      public queryParameters: Enviro.KeyValueStore;
      public settings: Enviro.REST.RequestSettingsContainer;
      public url: string;

      public getClientInformation(): Enviro.REST.RequestClientInfo;
      public isErrored(): boolean;
    }

    interface ResponseStatic {
      public logger: Enviro.Logging.Logger;

      new(request: Enviro.REST.Request): Enviro.REST.Response;
    }

    class Response extends ServerResponse {
      public body: Enviro.KeyValueStore;
      public bodyWritten: boolean;
      public logger: Enviro.Logging.Logger;
      public req: Enviro.REST.Request;
      public statusCode: number;

      constructor(request: Enviro.REST.Request);

      public end(cb?: () => void): this;
      public writeBody(): this;
    }
  }
}

export default Enviro;
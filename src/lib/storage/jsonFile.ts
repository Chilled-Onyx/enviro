import Enviro                    from '../types';
import { readFile, rm, writeFile } from 'fs/promises';
import { join as joinPath }        from 'path';
import { existsSync, mkdirSync }   from 'fs';

type JSONFileConfig = Enviro.KeyValueStore & { path: string };

class JSONFile {
  public readonly config: JSONFileConfig;
  public readonly enviro: Enviro.Application;

  constructor(config: Partial<JSONFileConfig>, enviro: Enviro.Application) {
    this.config = config as JSONFileConfig;
    this.enviro = enviro;

    this.config.path ||= './storage';
    this._createStorageDirectory();
  }

  protected _createStorageDirectory(): void {
    if(!existsSync(this.config.path)) {
      mkdirSync(this.config.path, { recursive: true });
    }
  }

  protected _getFilePath(settingsName: string): string {
    return joinPath(this.config.path, `${settingsName}.json`);
  }

  public async delete(settingsName: string): Promise<void> {
    try {
      await rm(this._getFilePath(settingsName));
    } catch {
      throw 'Unable to delete file.';
    }
  }

  public async read(settingsName: string): Promise<Enviro.KeyValueStore> {
    try {
      const content = await readFile(this._getFilePath(settingsName), 'utf8');
      return JSON.parse(content);
    } catch {
      throw 'Unable to read file.';
    }
  }

  public async write(settingsName: string, settings: Enviro.KeyValueStore): Promise<void> {
    try {
      await writeFile(
        this._getFilePath(settingsName),
        JSON.stringify(settings)
      );
    } catch {
      throw 'Unable to write file.';
    }
  }
}

export default JSONFile as Enviro.StorageAbstract;
# ENViro - Open source environmental configuration over HTTP(S)

ENViro is an open source application configuration management and listing API written in NodeJS with
zero (production) dependencies. It has expandable storage and plugin architecture to allow for customization to your specific needs.

## Getting started

Because there are no dependencies required, Enviro can be run right from cloning.

```
git clone git@github.com:Chilled-Onyx/enviro.git
node dist/index.js
```

Configuration modifications can be made in `dist/config.js` if you need something past standard.

By default JSON file storage will be used. It will store files in the ./storage directory.

## Docker

Build:
`docker build -t {localImageName} .`

It is a good idea to map a volume for the json storage
`docker run -v /path/to/local/directory:/opt/enviro/storage -d -p 80:80 {localImageName}`

## Storage

The storage definition is as follows:

```typescript
class Storage {
  constructor(config: Enviro.KeyValueStore, enviro: Enviro.Application);
  public delete(settingsName: string): Promise<void>;
  public read(settingsName: string): Promise<Enviro.KeyValueStore>;
  public write(
    settingsName: string,
    settings: Enviro.KeyValueStore
  ): Promise<void>;
}
```

Once you have created your object simply point the Enviro application class to it using the config.

## Plugins

Plugins allow you to create your own routes, authenticate requests, and modify settings objects before they are returned to the client.
You can look at `src/lib/plugins/manager.ts` for more information on how they are interacted with.

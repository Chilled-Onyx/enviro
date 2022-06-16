import Enviro from './lib/application';
import config from './config';
import EnviroTypes from './lib/types';

const enviro: EnviroTypes.Application = new Enviro(config);
enviro.rest.start();
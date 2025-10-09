import Ajv from 'ajv';
import * as validate from 'validate.js';
import { isArray } from 'validate.js';
import * as utils from './utils';

const customPrettify = (str: any) => str;

export const isValidOptionalPayload = (data: any) => {
  if (data.constructor === Object && Object.entries(data).length === 0) {
    return true;
  }
  const isEmpty = utils.isEmpty(data);
  return !isEmpty;
};

const parseValidateResult = (valResult: any) => {
  if (valResult) {
    const firstFieldError = Object.entries(valResult)[0][1] as string;
    const firstError = firstFieldError.toString().split(',')[0];
    const firstErrorWithoutCapitalization = firstError.charAt(0).toLowerCase() + firstError.slice(1);
    
    throw new Error(firstErrorWithoutCapitalization);
  }
};

/*
export const validationModels = async (entity: any, Constraints: any) => {
  const options = { prettify: customPrettify };
  const val = await validate.validate(entity, Constraints, options);
  if (val) {
    parseValidateResult(val);
  }
};
*/

export const cleanAdditionalProperties = async (data: any, whitelist: any) => {
  const refactData = await validate.cleanAttributes(data, whitelist);
  return refactData;
};

export const isValidSchema = async (valueType: any) => {
  const ajv = new Ajv();

  if (!(await ajv.validateSchema(valueType))) {
    throw new Error('Schema JSON inválido');
  }
};

export const isValidDataToSchema = async (schema: any, data: any) => {
  const ajv = new Ajv();
  const rest = await ajv.validate(schema, data);

  if (rest) {
    return true;
  }
  return false;
};

export const checkObjectArray = (objectArray: any[]) => {
  if (!isArray(objectArray)) {
    throw new Error('Valor deve ser um array');
  }
  
  objectArray.forEach((element, index) => {
    const elementType = typeof element === 'object';
    if (!elementType) {
      const message = `Atributo na posição ${index + 1} não é um objeto`;
      throw new Error(message);
    }
    if (utils.isEmpty(element)) {
      throw new Error('Dados não podem estar vazios');
    }
  });
};
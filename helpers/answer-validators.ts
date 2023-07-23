import { AnswerValidator } from "../interfaces/answer-validator.model";

export function validInt(a: string): number | null {
  if (isNaN(+a) || Math.floor(+a) !== +a) {
    console.info(`Your answer must be a valid integer`);
    return null;
  }
  return +a;
}

export function stringLength(maxLength: number): AnswerValidator<string> {
  return (a) => {
    if (a.length > maxLength) {
      console.info(`Your answer must be fewer than 1000 characters`);
      return null;
    }
    return a;
  }
}

export function validCurrency(allowNegatives: boolean): AnswerValidator<number> {
  return (a) => {
    const withoutNeg = /^\d*\.?\d{0,2}$/;
    const withNeg = /^(-)?\d*\.?\d{0,2}$/;
    const regex = allowNegatives ? withNeg : withoutNeg;

    if (!regex.test(a)) {
      console.info(`Your answer must be a valid currency amount`);
      return null;
    }

    return parseFloat(a);
  }
}

export function validDate(a: string): Date | null {
  const date = new Date(a);
  if (isNaN(date.getTime())) {
    console.info(`Your answer must be a valid date`);
    return null;
  }
  return date;
}

export function positiveNumber(a: string): number | null {
  const num = parseFloat(a);
  if (isNaN(num) || num <= 0) {
    console.info(`Your answer must be a positive number`);
    return null;
  }
  return num;
}

export function nonEmptyString(a: string): string | null {
  if (!a.trim()) {
    console.info(`Your answer cannot be empty`);
    return null;
  }
  return a;
}

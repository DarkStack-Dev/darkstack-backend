export interface Validator<input> {
  validate (input: input): void;
}
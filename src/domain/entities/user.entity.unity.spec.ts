import { ValidatorDomainException } from "../shared/exceptions/validator-domain.exception";
import { User } from "./user.entitty"

describe('Domain - User Entity', () => {

  describe('create', () => {
    it('should create a user when passing valid email and password', () => {
      // Arrange
      const anEmail = "john@doe.com";
      const aName = "John Doe";
      const aPassword = "12345678";
      
      // Act
      const anUser = User.create({ email: anEmail, password: aPassword, name: aName });

      // Assert
      expect(anUser).toBeInstanceOf(User);
      expect(anUser.getEmail()).toBe(anEmail);
      expect(anUser.getName()).toBe(aName);
      expect(anUser.getPassword()).not.toBe(aPassword);
      expect(anUser.getId()).toBeDefined();
      expect(anUser.comparePassword(aPassword)).toBe(true);
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);

    });

    it('should throw an error when passing invalid email', () => {
      const anEmail = "invalid-email";
      const aName = "Jo";
      const aPassword = '12344593';
      expect(() => {
        User.create({ email: anEmail, password: aPassword, name: aName });
      }).toThrow(ValidatorDomainException);
    });

    it('should throw an error when passing invalid password', () => {
      const anEmail = "john@doe.com"
      const aName = "John Doe";
      const aPassword = "1234"; // less than 8 characters
      expect(() => {
        User.create({ email: anEmail, password: aPassword, name: aName });
      }).toThrow(ValidatorDomainException);
    });

  });

  describe('comparePassword', () => {
    it('should return true when the informed password matches with user password', () => {
      const anEmail = "john@doe.com";
      const aName = "John Doe";
      const aPassword = "12345678";
      
      const anUser = User.create({ email: anEmail, password: aPassword, name: aName });

      expect(anUser.getPassword()).not.toBe(aPassword); // Password should be hashed

      const isPasswordValid = anUser.comparePassword(aPassword);
      expect(isPasswordValid).toBe(true);
    });

    it('should return false when the informed password does not match with user password', () => {
      const anEmail = "john@doe.com";
      const aName = "John Doe";
      const aPassword = "12345678";
      
      const anUser = User.create({ email: anEmail, password: aPassword, name: aName });

      const isPasswordValid = anUser.comparePassword('aPasswordThatDoesNotMatch');
      expect(isPasswordValid).toBe(false);
    });

  });
});
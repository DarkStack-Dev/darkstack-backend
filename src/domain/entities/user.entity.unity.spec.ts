import { User } from "./user.entitty"

describe('Domain - User Entity', () => {

  describe('create', () => {
    it('should create a user when passing valid email and password', () => {
      const anEmail = "john@doe.com";
      const aName = "John Doe";
      const aPassword = "12345678";
      
      const anUser = User.create({ email: anEmail, password: aPassword, name: aName });

      expect(anUser).toBeInstanceOf(User);
      expect(anUser.getEmail()).toBe(anEmail);
      expect(anUser.getName()).toBe(aName);
      expect(anUser.getPassword()).not.toBe(aPassword);
      expect(anUser.getId()).toBeDefined();
      expect(anUser.comparePassword(aPassword)).toBe(true);
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);


  })
})})
var expect = require('chai').expect;
var variableInjector = require('../lib/variable-injector');

describe('variable-injector', function() {
  describe('#inject', function() {
    it('should replace placeholders', function() {
      process.env.ANIMAL = 'dog';
      var contents = 'This is a #{ANIMAL}!';
      var result = variableInjector.inject(contents);

      expect(result).to.equal('This is a dog!');
    });
    it('should replace multiple duplicate placeholders', function() {
      process.env.ANIMAL = 'dog';
      var contents = 'This is a #{ANIMAL}! Do you like #{ANIMAL}s?';
      var result = variableInjector.inject(contents);

      expect(result).to.equal('This is a dog! Do you like dogs?');
    });
    it('should replace multiple different placeholders', function() {
      process.env.ANIMAL_1 = 'dog';
      process.env.ANIMAL_2 = 'cat';
      var contents = 'You like #{ANIMAL_1}s, and I like #{ANIMAL_2}s!';
      var result = variableInjector.inject(contents);

      expect(result).to.equal('You like dogs, and I like cats!');
    });
    it('should replace undefined environment variables with "undefined"', function() {
      var contents = 'Oh no! I am #{SOMETHING}!';
      var result = variableInjector.inject(contents);

      expect(result).to.equal('Oh no! I am undefined!');
    });
  });
});

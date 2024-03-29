const { User, Book } = require('../models');
const { signToken } = require('../utils/auth')
const { AuthenticationError } = require('apollo-server-express');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _Id: context.user._id}).select('-__v -password');
        return userData
      }
      throw new AuthenticationError('You must be logged in')
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        const updateUser = await User.findOneAndUpdate(
            {_id: context.user._id},
            {$addToSet: {savedBooks: book} },
            {new: true}
        )
        return updateUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updateUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: bookId } },
            {new: true}
          );
    
          return updateUser;
        }
        throw new AuthenticationError('You need to be logged in!');
      },
  },


};

module.exports = resolvers;

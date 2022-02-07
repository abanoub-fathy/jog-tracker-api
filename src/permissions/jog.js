const canAccessJog = (requesterUser, jogOwnerId) => {
  switch (requesterUser.role) {
    case "admin":
      return true;
    default:
      // if the requester user id matches the jog owner id
      return requesterUser._id.toString() === jogOwnerId.toString();
  }
};

const canViewListOfJogs = (requesterUser, requestedUserId) => {
  switch (requesterUser.role) {
    case "admin":
      return true;
    default:
      return requesterUser._id.toString() === requestedUserId.toString();
  }
};

module.exports = { canAccessJog, canViewListOfJogs };

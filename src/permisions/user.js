const canAccessUserProfile = (requesterUser, requestedUser) => {
  switch (requesterUser.role) {
    case "admin":
      return true;
    case "manager":
      // manger is allowed to see his/her profile or normal users profile
      if (requesterUser._id.toString() === requestedUser._id.toString()) {
        return true;
      } else if (requestedUser.role === "normal") {
        return true;
      } else {
        return false;
      }
    case "normal":
      return requesterUser._id.toString() === requestedUser._id.toString();
  }
};

module.exports = {
  canAccessUserProfile,
};

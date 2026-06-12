// const verifyOwnerOrAdmin = (req, res, next) => {
//   const targetId = req.params.id;
//   if (req.user?.role === "admin" || req.user?.userId === targetId) {
//     return next();
//   }
//   return res.status(403).send("unauthorized");
// };
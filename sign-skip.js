// Dummy signing script to skip code signing
exports.default = async function(configuration) {
  // Skip signing
  return true;
};

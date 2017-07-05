/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:16:34 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:16:34 
 */
module.exports = function(env) {
  return require(`./webpack.config.${env}.js`);
}
function durationToMilliseconds(durationString) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
  
    const durationArray = durationString.match(/(\d+)([smhd])/);
    if (!durationArray) {
      throw new Error('!! La function durationToMilliseconds a provoqué une erreur : Cela ne ressemble pas à une string de duration !');
    }
    
    const [, value, unit] = durationArray;
    const milliseconds = units[unit] * parseInt(value, 10);
    return milliseconds;
  }
  
  module.exports = durationToMilliseconds;
const fs = require("fs");
const path = require("path");

const generateParsedString = (classes) => {
  if (classes.includes("hover:before") || classes.includes("hover:after")) {
    return classes.substring(0, classes.lastIndexOf(":hover"));
  }
  return classes;
};

function handler(cssPath) {
  const filePath = path.resolve(".", cssPath); // Relative path from root of your project =>build/output.css
  const imageBuffer = fs.readFileSync(filePath);
  let data = imageBuffer
    .toString()
    .replace(/(\r\n|\n|\r)/gm, "")
    .match(
      /([\&!#A-z '\][calc\(^*)\][_A-Za-z0-9\/-|-\\[.,\n.0-9+\%\]" ~]+ {)/gm
    )
    .map((item) => {
      let classes = item.replace(/[\\{]/g, "").trim();

      //Condition to handle "." before className
      if (classes.split(" ").length > 1) {
        let splitStr = classes.split(" ");
        let data = splitStr.map((str) => {
          if (str.charAt(0) === ".") {
            return str.substring(1);
          }
          return str;
        });
        classes = data.join(" ");
      } else {
        classes = classes.substring(1);
      }
      //
      let regexTest = new RegExp("::");

      let test = regexTest.test(classes);
      if (test) {
        regexTest = new RegExp("::before");
        if (regexTest.test(classes)) {
          return generateParsedString(
            classes.substring(0, classes.lastIndexOf("::before"))
          );
        }

        regexTest = new RegExp("::after");
        if (regexTest.test(classes)) {
          return generateParsedString(
            classes
              .substring(0, classes.lastIndexOf("::after"))
              .replace(/["']/g, "'")
          );
        }

        regexTest = new RegExp("::-webkit-scrollbar");
        if (regexTest.test(classes)) {
          return generateParsedString(
            classes.substring(0, classes.lastIndexOf("::-webkit-scrollbar"))
          );
        }

        regexTest = new RegExp("::first-letter");
        if (regexTest.test(classes)) {
          return generateParsedString(
            classes.substring(0, classes.lastIndexOf("::first-letter"))
          );
        }
      }
      regexTest = new RegExp(":hover");
      if (regexTest.test(classes)) {
        if (classes.split(" ").length > 1) {
          return classes;
        }
        let subStringResult = classes.substring(
          0,
          classes.lastIndexOf(":hover")
        );
        return subStringResult;
      }
      regexTest = new RegExp(">[*]:");
      if (regexTest.test(classes)) {
        return classes.substring(0, classes.lastIndexOf(">*:"));
      }

      return classes.replace(/(2c )/gm, ",");
    });

  let resp = data.reduce((acc, item) => {
    if (data.some((name) => name === item) && !acc?.includes(item)) {
      let ac = [...acc, item];
      return ac;
    }
    return acc;
  }, []);

  return resp;
}

module.exports = handler;

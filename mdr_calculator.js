const Calculator = {
  parseDelimiters(input) {
    let firstNewLineIndex;
    let delimiters = [];
    let delimiter;

    for (let index = 0; index < input.length; index += 1) {
      if (input[index] === '\n') {
        firstNewLineIndex = index;
      }
    }

    const joinedDelimiters = input.substring(2, firstNewLineIndex);
    let prevDelimitEndIndex = -1;

    for (let index = 0; index < joinedDelimiters.length; index += 1) {
      if (index === joinedDelimiters.length - 1 ||
        joinedDelimiters[index] !== joinedDelimiters[index + 1]) {

        delimiter = joinedDelimiters.substring(prevDelimitEndIndex + 1, index + 1);
        delimiters.push(delimiter);
        prevDelimitEndIndex = index;
      }
    }

    return delimiters;
  },

  generateInvalidDelimiterException(delimiter) {
    const message = "Invalid Delimiter"
    const error = new Error(message);
    error.invalidDelimiter = delimiter;
    return error;
  },

  validateDelimiter(delimiters, delimiter) {
    if (delimiters.includes(delimiter) === false) {
      let error = this.generateInvalidDelimiterException(delimiter);
      throw error;
    }
  },

  splitSegments(input, delimiters) {
    const segments = [];
    let delimiterStartIndex;
    let delimiterEndIndex = 0;
    let segment;
    let delimiter;
    let character;

    for (let index = 0; index < input.length; index += 1) {
      character = input[index];

      if (character.match(/[^0-9\-\n]/) && delimiterStartIndex === undefined) {
        delimiterStartIndex = index;
        continue;
      }

      if (character.match(/[0-9\-\n]/) && delimiterStartIndex >= 0) {
        segment = input.substring(delimiterEndIndex, delimiterStartIndex);
        delimiter = input.substring(delimiterStartIndex, index);
        this.validateDelimiter(delimiters, delimiter);
        segments.push(segment);
        delimiterEndIndex = index;
        delimiterStartIndex = undefined;
      }
    }

    if (input[delimiterEndIndex].match(/[0-9\-\n]/) &&
      delimiterStartIndex > delimiterEndIndex) {
      segment = input.substring(delimiterEndIndex, delimiterStartIndex);
      delimiter = input.substring(delimiterStartIndex);
      this.validateDelimiter(delimiters, delimiter);
      segments.push(segment);
    } else {
      segment = input.substring(delimiterEndIndex);
      segments.push(segment);
    }

    return segments;
  },

  coerceSegmentsToNumbers(characters) {
    return (characters.map(stringSection => {
      let trimmedSection = stringSection.trim();

      if (trimmedSection === '') {
        return 0;
      } else {
        let number = parseInt(trimmedSection);

        if (number > 1000) {
          return 0;
        } else {
          return number;
        }
      }
    }));
  },

  ommitControl(input) {
    let lastControlIndex;

    for (let index = 0; index < input.length; index += 1) {
      if (input[index] === '\n') {
        lastControlIndex = index;
        break;
      }
    }

    return input.slice(lastControlIndex + 1)
  },

  generateNegativeNumberException(negativeNumbers) {
    const message = "Negatives are not allowed"
    const error = new Error(message);
    error.negativeNumbers = negativeNumbers;
    return error;
  },

  add(input) {
    let delimiters;
    let trimmedInput = input;

    if (input.substring(0, 2) === "//") {
      delimiters = this.parseDelimiters(trimmedInput);
      trimmedInput = this.ommitControl(trimmedInput);
    } else {
      delimiters = [","]
    }

    trimmedInput = trimmedInput.trim();

    if (trimmedInput.length === 0) {
      return 0;
    }

    const inputSegments = this.splitSegments(trimmedInput, delimiters);

    const numbers =
      this.coerceSegmentsToNumbers(inputSegments);

    const negativeNumbers = numbers.filter(number => number < 0);

    if (negativeNumbers.length > 0) {
      const error = this.generateNegativeNumberException(negativeNumbers);
      throw error;
    }

    return (numbers.reduce((sum, currentNumber) => {
      return sum + currentNumber;
    }, 0));
  }
}

// handle comma delimiter
let input = "1,2,5";
console.log(Calculator.add(input)); // 8

input = "100";
console.log(Calculator.add(input)); // 100

input = "";
console.log(Calculator.add(input)); // 0

input = " ,2,5,10";
console.log(Calculator.add(input)); // 17

input = "10,1,2, ";
console.log(Calculator.add(input)); // 13

// handle new lines
input = "1,\n2,4";
console.log(Calculator.add(input)); // 7

input = "\n,\n2,4";
console.log(Calculator.add(input)); // 6

input = "1,\n\n2,4";
console.log(Calculator.add(input)); // 7

input = "10,1,2,\n";
console.log(Calculator.add(input)); // 13

input = "10,1,2,\n,";
console.log(Calculator.add(input)); // 13

// handle custom delimiter
input = "//;\n1;3;4";
console.log(Calculator.add(input)); // 8

input = "//$\n1$2$3";
console.log(Calculator.add(input)); // 6

input = "//@\n2@3@8";
console.log(Calculator.add(input)); // 13

// handle arbitrary length delimiter
input = "//***\n1***2***3";
console.log(Calculator.add(input)); // 6

input = "//&&\n2&&3&&9";
console.log(Calculator.add(input)); // 14

input = "//((((\n2((((3((((";
console.log(Calculator.add(input)); // 5

// negative number exception
// input = "//***\n1***-2***3";
// console.log(Calculator.add(input)); // error: -2

// input = "//&&\n2&&-3&&-9";
// console.log(Calculator.add(input)); // error: -3, -9

// input = "//@!\n-2!-3@-8@1001";
// console.log(Calculator.add(input)); // error: -2, -3, -8

// ignore numbers > 1000

input = "1,2,1001";
console.log(Calculator.add(input)); // 3

input = "2000";
console.log(Calculator.add(input)); // 0

input = "//@!\n2!3!8@1000";
console.log(Calculator.add(input)); // 1013

input = "//@@\n2@@3@@8@@1001";
console.log(Calculator.add(input)); // 13

// handle multiple delimiters

input = "//$,@\n1$2@3";
console.log(Calculator.add(input)); // 6

input = "//$,@\n";
console.log(Calculator.add(input)); // 0

input = "//$,@\n1,";
console.log(Calculator.add(input)); // 1

// handle multiple delimiters of arbitrary length 

input = "//$$,@@@\n1$$2,3@@@4";
console.log(Calculator.add(input)); // 10

input = "//$$,@@@\n1$$1@@@1001";
console.log(Calculator.add(input)); // 2

// invalid delimiter

// input = "//$$,@@@\n1$(2,3@@@4";
// console.log(Calculator.add(input)); // 10 error: $(





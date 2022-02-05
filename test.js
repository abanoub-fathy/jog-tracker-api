let arr = [1, 2, 3, 7, 50];
let report = [];

let winStart = arr[0];
let winEnd = arr[0] + 6;
let week = {
  from: winStart,
  to: winEnd,
  nums: [],
};

// loop through the array
for (let i = 0; i < arr.length; i++) {
  if (arr[i] >= winStart && arr[i] <= winEnd) {
    week.nums.push(arr[i]);
  } else {
    // add the week object to the report
    report.push({ ...week });
    // reset winStart, winEnd and the week object
    winStart = winEnd + 1;
    winEnd = winStart + 5;
    week = {
      from: winStart,
      to: winEnd,
      nums: [],
    };
    i = i - 1;
  }
}
report.push({ ...week });

console.log(report);

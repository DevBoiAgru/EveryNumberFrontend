import { StarredNumbers } from "./Stores";

// Load starred numbers from localstorage
const savedNumsStr = localStorage.getItem("starred-nums");

// Convert string to json
const savedNumsJSON: Array<string> = JSON.parse(savedNumsStr ?? "[]");
let savedNums: Array<bigint> = [];
// Convert array of string to array of bigints
for (let i = 0; i < savedNumsJSON.length; i++) {
    savedNums.push(BigInt(savedNumsJSON[i]));
}

StarredNumbers.update(() => new Set(savedNums));

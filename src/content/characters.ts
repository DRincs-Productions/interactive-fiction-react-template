import Character from "@/models/Character";
import { RegisteredCharacters } from "@drincs/pixi-vn";

export const mc = new Character("mc", {
    name: "Me",
});

export const gatekeeper = new Character("gatekeeper", {
    name: "Wilkin",
});

export const steward = new Character("steward", {
    name: "Osric",
});

export const mara = new Character("mara", {
    name: "Mara",
});

RegisteredCharacters.add([mc, gatekeeper, steward, mara]);

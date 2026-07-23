import Character from "@/models/Character";
import { RegisteredCharacters } from "@drincs/pixi-vn";

export const mc = new Character("mc", {
    name: "Me",
});

export const gatekeeper = new Character("gatekeeper", {
    name: "Wilkin",
    color: "#6b7a8f",
});

export const steward = new Character("steward", {
    name: "Osric",
    color: "#9c7a3c",
});

RegisteredCharacters.add([mc, gatekeeper, steward]);

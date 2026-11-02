=== second_part ===
# chapter chapter_the_watchtower
steward: "The old watchtower past the orchard. Something's been moving lights up there after dark. Go take a look, and don't let your torch go out."
mc: "That's it? Look at some lights?"
<- second_part_omen
[steward]'s smile doesn't reach his eyes.
steward: "That's it. For tonight."
You take the torch he offers, and step back out into the rain.
-> second_part_end

=== second_part_omen ===
Older hands in the hall go quiet at the mention of the tower, exchanging a look you're not meant to see.
<>An old woman mending a net near the fire mutters a word you don't catch and touches two fingers to her collarbone, the way people do here to ward off bad luck. Nobody offers to explain, and nobody meets your eye when you ask.
<>Whatever [steward] isn't telling you, you have a feeling you're about to find out.
-> DONE

=== second_part_end ===
# stop sound bgm_medieval_hall
# play sound sfx_rain_ambience channel bgm loop true
The orchard is a black tangle in the dark, and beyond it, the watchtower waits - one narrow window burning with a light no torch ever made: ![The watchtower at night](watchtower)
<>The wind through the dead branches sounds almost like breathing. Your own torch gutters once, twice, and steadies only when you cup a hand around the flame and keep walking.
# play sound sfx_torch_crackle
<>Whatever is waiting behind that light, it isn't going to come down and meet you halfway. You push open the tower's low door and start up the stairs.
-> watchtower_reveal

=== watchtower_reveal ===
The stairs are narrow and slick with damp, and the light above grows steadier the higher you climb - not a torch's flicker, but something held deliberately still.
<>At the top, a woman crouches by the narrow window, a shuttered lantern in her hands and a coil of rope at her feet. She goes rigid at the sound of your boots on the last step.
mara: "Don't shout. Please. Just - give me a moment before you shout."
mc: "Who are you? What are you doing up here?"
mara: "Signalling a boat. There's a village past the point the toll roads have cut off since the lord raised the bridge tax - no grain in or out for two months. My brother's crew runs what they can past the watch, and this tower's the only light the river pilot can find in the dark."
<>She says it fast, like she's rehearsed the version that might save her. You think of the empty larder back home, and the eleven days it took to outwalk your own hunger.
<>You could turn around right now and tell [steward] exactly what's burning in his watchtower. Or you could walk back down those stairs and say you saw nothing at all.
* [Tell Osric what you found]
    -> watchtower_end_report
* [Say you saw nothing]
    -> watchtower_end_mercy

=== watchtower_end_report ===
You climb back down without another word to her, and cross the black orchard at a near-run, your torch guttering with every stride.
mc: "There's a woman in the tower, signalling a smuggler's boat," you tell [steward], breathless. "She's still up there."
[steward]'s face doesn't change, but he's already reaching for the horn that hangs by the door.
By the time the watch reaches the tower, the light is out and the river is empty. Whether she got away or not, nobody tells you, and you don't ask twice.
<>[steward] pays you fairly, and says you've a good eye for trouble. It doesn't feel like the compliment he means it to be.
<>— The End —
-> END

=== watchtower_end_mercy ===
mc: "I didn't see anything up here worth mentioning. Finish quickly."
[mara] stares at you a long moment, then nods once and turns back to the window, working the lantern's shutter in a slow, practiced rhythm.
<>You wait with her in the dark until a shape on the river answers, a single lamp blinking back. Only then does she let the shutter close for good.
mara: "Thank you. I mean it."
She's down the stairs and into the orchard before you've found anything to say back.
<>[steward] accepts your report of "nothing but roosting owls" without much interest, and pays you regardless. You sleep well that night - the first time in eleven days.
<>— The End —
-> END

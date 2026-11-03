=== start ===
# chapter chapter_the_keep
# play sound sfx_rain_ambience channel bgm loop true
The road climbs toward the keep through mud that sucks at every step, under a sky the colour of an old bruise.
<>By the time the gate comes into view, the rain has soaked clean through your cloak.
A gatekeeper leans over the palisade, torchlight catching the rust on his pike.
gatekeeper: "Nobody comes up this road for nothing. Who are you, and what's your business at the keep?"
# request input type string default Edmund
He waits for your name.
# rename mc { _input_value_ }
mc: "[mc]," you call back. "I was told the steward is hiring hands before winter."
<- start_memory
# play sound sfx_gate_creak
[gatekeeper] grunts, satisfied enough, and hauls the gate open.
gatekeeper: "Go on, then. Great Hall's straight across the yard - can't miss it."
-> start_hall

=== start_memory ===
You think, not for the first time, of the empty larder back home, and the letter that brought you here: three lines, promising work to anyone willing to do it.
<>Your mother sold the last of the goats before you left, and it still wasn't enough - not with two more mouths at the table and the frost coming early this year. Nobody said it out loud, but everyone understood: one of you had to go, and you were the one who could be spared.
<>Eleven days you walked to answer three lines of ink, sleeping in ditches and church porches, trading chores for bread when your coin ran out. If the steward turns you away tonight, you're not entirely sure what's left to walk back to.
<>Whatever waits across that yard, it has to be better than another winter with nothing to show for it.
-> DONE

=== start_hall ===
# stop sound sfx_rain_ambience
# play sound bgm_medieval_hall channel bgm loop true
![The keep in summer](keep_hall "45% right")The Great Hall smells of woodsmoke and old wax. Above the hearth hangs a painted view of the keep at midsummer.
mc: "I'm here about the work," you say.
[steward] sets down his quill.
steward: "Then you'll want to prove you're worth feeding, first."
# require link
steward: He nods toward a nail-worn notice pinned by the door. [Read the notice](notice_board)
-> DONE

=== notice_board ===
The board by the door is crowded with the keep's business, wax-stiff scraps layered three deep: a bounty on a wolf that's been taking sheep from the low pasture, a plea for anyone who can splint a broken arm, a betrothal notice gone yellow at the corners.
<>Pinned above the rest, newer than the others, is the one you walked eleven days for - short and blunt: "Seeking able hands. Nights only. Ask the steward."
<>Nothing you didn't already gather. Still, seeing it nailed up in ink makes it feel less like a rumour and more like a job.
-> start_hall_task

=== start_hall_task ===
<>steward: "There's a task needs doing tonight. Simple enough - if you've got the nerve for it."
* [Ask what the task is]
    -> second_part
* [Say you'd rather wait until morning]
    -> start_wait_morning

=== start_wait_morning ===
mc: "Whatever it is, it'll keep till morning," you say. "I've had enough of the rain for one night."
[steward] studies you a moment, then shrugs and waves you toward a bench by the fire. Sleep finds you fast - the first roof over your head in eleven days.
# stop sound bgm_medieval_hall
You wake to grey morning light and the hall filling up with breakfast noise. [steward] is already at his table, and he doesn't look up.
steward: "Slept well? Good. Old Godwin took the watchtower job in the end - didn't fancy waiting on a stranger to make up his mind."
<>He doesn't offer you another task. Sitting there with a cold bowl of porridge, you get the feeling you've already had your one chance to prove yourself - and let it pass.
<>— The End —
-> END

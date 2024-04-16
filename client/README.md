# cowordination

Cowordination is a cooperative word game where players try to select the same word as the selector based on limited information.

Players should be able to join the game by going to url with a seed, such as:

http://www.heroku.cowordination.com/GHMK
Here GHMK is the seed.

or by going to http://www.heroku.cowordination.com/
and creating/selecting game room.

When player goes to http://www.cowordination.com/, they should be able to either enter seed to join, or create new room.

Now, the game itself:

Game has the following configuration parameters:

-   WORDS_TOTAL_NUM: total number of words (default = 25)
-   WORDS_HIGHLIGHTED_NUM: number of words randomly chosen as highlighted anchor words (default = 1)
-   WORDS_TO_SELECT_NUM: number of related words to select (default = 1)

For the toy example below, we shall use the values:

-   WORDS_TOTAL_NUM=5
-   WORDS_HIGHLIGHTED_NUM=2
-   WORDS_TO_SELECT_NUM=2

Then for the words themselves for the toy example, we will use:
WORDS_TOTAL = ["BUNNY", "GREAT", "JOB", "SKETCH", "LIGHT"]
WORDS_HIGHLIGHTED = ["JOB", "BUNNY"]

Game rules:
One player gets assigned as the master selector.
Based on the highlighted word(s), he will choose the next word(s) that follow, for the total of WORDS_TO_SELECT_NUM.

In our example, he will secretly choose and click the words that make the most sense after "JOB", "BUNNY", out of remaining words ("GREAT", "SKETCH", "LIGHT").

Suppose he chose SKETCH and LIGHT.

Now, all remaining players also choose their related words.
On the UI side of things, players should be able to select and unselect words (which will show up with the frame around the word), and then click SUBMIT when they are ready. You can only submit if your number of selected words is equal to WORDS_TO_SELECT_NUM, of course.

Once everyone had chosen, the choices are revealed. At this point, each word will have, in small font, name of all players who clicked on it (including master selector.) Additionally, words selected by master selector will be outlined with a thick green border.

Score is calculated as follows:

## 1. Team score:

The exact calculation is TBD, and should be a self-contained function calculate_team_score() I can work on. That function should take in arguments:

-   player_selections is a list of dicts with values id (str), name (str), words_selected (list), master (TF)
-   WORDS_TOTAL_NUM is a num
-   WORDS_HIGHLIGHTED_NUM is a num
-   WORDS_TO_SELECT_NUM is a num

For V1, it will only use players' selections and work like so:
Every overlap with the master selector is one point.
This is divided by total possible points and normalized to be out of 10, rounded up.
For example, if two other players are guessing, and they guessed:
Player 1: Sketch, Light
Player 2: Sketch, Moscow
That means they got 3 correct
Maximum correct possible is 4.
Score = (3/4)\*10 = 7.5, rounded up -> 8 points.

## 2. Individual score:

Similar to above, calculate_individual_scores() function should be contained for easy editing. For now, in example above, Player 1 will have 10 points and player 2 will have 5 points.
Master selector's individual score is equal to the team score.

This scoring system doesn't take into account total possible choices, and in the future I may edit it to use it.

After the round is done, anyone can click "next round". In addition to the score of that round being tracked, average score of all rounds is being tracked as well.

At the end of every round, rather than choosing "next round", user can click "finish game" and that concludes the game. Table will appear showing columns "round" and "score" and the final average score as well.

Any player can then start a new game with "New Game" button.

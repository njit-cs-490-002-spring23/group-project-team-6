import React from 'react';
import PlayerController from '../../classes/PlayerController';

type PlayerNameProps = {
  player: PlayerController;
};

export function DisplayTurn({ player }: PlayerNameProps): JSX.Element {
  return (
    <>
      <h1>It is {player.userName}'s turn</h1>
    </>
  );
}

export function DisplayWait(): JSX.Element {
  return (
    <>
      <h1>Waiting for more players</h1>
    </>
  );
}

export function Ready(): JSX.Element{
    return(
        <h1>Press ready button if you would like to start game!</h1>
    )
}

// need to know moves to properly implement

// export function invalidMove({move: ActionSpace}): JSX.Element{
//     return(
//         <>
//         { move.isValid &&  <h1>This is an </h1>}
//         </>
//     )
// }

// export function draw2Event(event: UnoEvents): JSX.Element{
//     return(
//         <>
//         {event.isDraw2 && <h1> DRAW +2 </h1>}
//         </>
//     )
// }
import React from 'react';
import Phaser from 'phaser';
import { useEffect } from 'react';
import Interactable from '../Town/Interactable';
import { DisplayTurn, DisplayWait,Ready } from './UnoTable';

export default function  UnoGamePage(){
    return (
      <div className="page-container">
        <div className="table"></div>
        <div className="turnTable">
         <DisplayWait/>
        </div>
      </div>
    );
  };

/* eslint-disable react-hooks/preserve-manual-memoization */
import { useMemo } from 'react';

import {
  buildNavigationInstructions,
  type NavigationInstruction,
} from '@/services/navigation/instructions';
import type {
  NavigationGraph,
  NavigationNode,
  Route,
} from '@/types/navigation';
import type { Position } from '@/types/position';
import { getClosestRouteSegment } from '@/utils/navigation';

interface UseNavigationInstructionsResult {
  instructions: NavigationInstruction[];
  currentInstruction: NavigationInstruction | null;
  currentInstructionIndex: number;
  distanceToInstruction: number;
}

const TURN_TRIGGER_DISTANCE = 2;

function getNode(
  graph: NavigationGraph,
  nodeId: string,
): NavigationNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function useNavigationInstructions(
  position: Position | null,
  route: Route | null,
  graph: NavigationGraph,
  arrived = false,
): UseNavigationInstructionsResult {
  const instructions = useMemo(() => {
    if (!route) {
      return [];
    }

    return buildNavigationInstructions(route, graph);
  }, [route, graph]);

  const navigationState = useMemo(() => {
    if (!position || !route || instructions.length === 0) {
      return {
        currentInstructionIndex: -1,
        distanceToInstruction: 0,
      };
    }

    /*
     * Arrival is controlled by useNavigation.
     *
     * We must not show "arrived" simply because
     * the final node is the destination.
     */
    if (arrived) {
      const arrivalIndex = instructions.findIndex(
        (instruction) => instruction.type === "arrive",
      );

      return {
        currentInstructionIndex: arrivalIndex,
        distanceToInstruction: 0,
      };
    }

    const closestSegment = getClosestRouteSegment(position, route, graph);

    if (!closestSegment) {
      return {
        currentInstructionIndex: -1,
        distanceToInstruction: 0,
      };
    }

    /*
     * Find the next TURN instruction.
     *
     * We do not activate it immediately.
     * It only becomes active when the user
     * is close enough to the turn.
     */
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];

      /*
       * Arrival is handled separately above.
       */
      if (instruction.type === "arrive") {
        continue;
      }

      const nodeIndex = route.nodeIds.findIndex(
        (nodeId) => nodeId === instruction.nodeId,
      );

      if (nodeIndex === -1) {
        continue;
      }

      /*
       * The turn must still be ahead of the user.
       */
      if (nodeIndex <= closestSegment.segmentIndex) {
        continue;
      }

      const instructionNode = getNode(graph, instruction.nodeId);

      if (!instructionNode) {
        continue;
      }

      const distanceToNode = Math.hypot(
        position.x - instructionNode.x,
        position.y - instructionNode.y,
      );

      /*
       * We are still far from the turn.
       *
       * Do NOT show "turn left/right" yet.
       */
      if (distanceToNode > TURN_TRIGGER_DISTANCE) {
        return {
          currentInstructionIndex: -1,
          distanceToInstruction: distanceToNode,
        };
      }

      /*
       * We are close enough to announce
       * the turn.
       */
      return {
        currentInstructionIndex: i,
        distanceToInstruction: distanceToNode,
      };
    }

    /*
     * No active turn instruction.
     */
    return {
      currentInstructionIndex: -1,
      distanceToInstruction: 0,
    };
  }, [position, route, graph, instructions, arrived]);

  const currentInstruction =
    navigationState.currentInstructionIndex >= 0
      ? instructions[navigationState.currentInstructionIndex]
      : null;

  return {
    instructions,
    currentInstruction,
    currentInstructionIndex: navigationState.currentInstructionIndex,
    distanceToInstruction: navigationState.distanceToInstruction,
  };
}

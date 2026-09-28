export const dijkstraPracticalConfig = () => ({
  description:
    "Use Dijkstra's algorithm to find the shortest path distances from a source vertex in a weighted graph.",

  instructions: `Write a complete C program using the starter code below.

The program must implement Dijkstra's shortest path algorithm.

The graph contains 6 vertices:
A, B, C, D, E and F.

The program should calculate the shortest distance from the source vertex A to every other vertex.

IMPORTANT:
- Your output format does not need to exactly match the starter output.
- You only need to produce the correct shortest distances.
- Spaces, newlines, tabs, and labels such as "A", "B", etc. will be ignored by the Dijkstra checker.
- The checker will verify the numerical distances.

For example, all of the following can be accepted if the distances are correct:

0 1 2 4 2 3

or

A = 0
B = 1
C = 2
D = 4
E = 2
F = 3

or

Vertex dist from source vertex
A 0
B 1
C 2
D 4
E 2
F 3`,

  starterTemplate: {
    c: {
      prefix: "",
      starterSolution: `#include<stdio.h>
#include<limits.h>
#include<stdbool.h>

void greedy_dijsktra(int graph[6][6], int src){
    // write your solution here
}

int main(){
    int graph[6][6] = {
        {0, 1, 2, 0, 0, 0},
        {1, 0, 0, 5, 1, 0},
        {2, 0, 0, 2, 3, 0},
        {0, 5, 2, 0, 2, 2},
        {0, 1, 3, 2, 0, 1},
        {0, 0, 0, 2, 1, 0}
    };

    greedy_dijsktra(graph, 0);

    return 0;
}`,
      suffix: "",
    },
  },

  testCases: [
    {
      input: `6 0
0 1 2 0 0 0
1 0 0 5 1 0
2 0 0 2 3 0
0 5 2 0 2 2
0 1 3 2 0 1
0 0 0 2 1 0`,
      expected: [0, 1, 2, 4, 2, 3],
      visibility: "public",
      weight: 1,
      checker: "dijkstra",
    },
    {
      input: `5 0
0 4 1 0 0
4 0 2 1 0
1 2 0 5 3
0 1 5 0 2
0 0 3 2 0`,
      expected: [0, 3, 1, 4, 4],
      visibility: "hidden",
      weight: 1,
      checker: "dijkstra",
    },
    {
      input: `6 0
0 2 0 0 0 5
2 0 3 1 0 0
0 3 0 2 4 0
0 1 2 0 1 6
0 0 4 1 0 2
5 0 0 6 2 0`,
      expected: [0, 2, 5, 3, 4, 5],
      visibility: "hidden",
      weight: 1,
      checker: "dijkstra",
    },
  ],
});

export default dijkstraPracticalConfig;

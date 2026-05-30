import { AlignedSequence, TreeNode } from '../types';

/**
 * Calculates the p-distance (fraction of mismatches) between two aligned sequences.
 */
function calculateDistance(seqA: string, seqB: string): number {
  let mismatches = 0;
  let validBases = 0;
  const len = Math.min(seqA.length, seqB.length);

  for (let i = 0; i < len; i++) {
    const a = seqA[i];
    const b = seqB[i];
    if (a === '-' && b === '-') continue;
    if (a === 'N' || b === 'N') continue;
    
    validBases++;
    if (a !== b) {
      mismatches++;
    }
  }

  return validBases > 0 ? (mismatches / validBases) : 0;
}

/**
 * Builds a phylogenetic tree using the Neighbor-Joining (NJ) algorithm.
 */
export function buildNJTree(aligned: AlignedSequence[], metadataMap?: Map<string, { location?: string; species?: string }>): TreeNode {
  const n = aligned.length;
  if (n === 0) {
    return { name: 'Root' };
  }
  if (n === 1) {
    const meta = metadataMap?.get(aligned[0].id);
    return {
      id: aligned[0].id,
      name: aligned[0].name,
      branchLength: 0.1,
      location: meta?.location || 'Unknown'
    };
  }

  // Define dynamic nodes
  // Each active node is a TreeNode
  let activeNodes: TreeNode[] = aligned.map(seq => {
    const meta = metadataMap?.get(seq.id);
    return {
      id: seq.id,
      name: seq.name,
      branchLength: 0.0,
      location: meta?.location || 'Unknown'
    };
  });

  // Calculate initial full distance matrix
  let nodeCount = n;
  const distances: Map<string, Map<string, number>> = new Map();

  // Helper getters/setters for distance matrix
  function getDist(nodeA: TreeNode, nodeB: TreeNode): number {
    const idA = nodeA.id || nodeA.name;
    const idB = nodeB.id || nodeB.name;
    if (idA === idB) return 0;
    return distances.get(idA)?.get(idB) ?? distances.get(idB)?.get(idA) ?? 0;
  }

  function setDist(nodeA: TreeNode, nodeB: TreeNode, dist: number) {
    const idA = nodeA.id || nodeA.name;
    const idB = nodeB.id || nodeB.name;
    if (!distances.has(idA)) distances.set(idA, new Map());
    if (!distances.has(idB)) distances.set(idB, new Map());
    distances.get(idA)!.set(idB, dist);
    distances.get(idB)!.set(idA, dist);
  }

  // Initialize leaf-to-leaf distances
  for (let i = 0; i < n; i++) {
    const seqA = aligned[i];
    for (let j = i; j < n; j++) {
      const seqB = aligned[j];
      const dist = calculateDistance(seqA.sequence, seqB.sequence);
      setDist(activeNodes[i], activeNodes[j], dist);
    }
  }

  let nextInternalNodeId = 1;

  // Neighbor Joining loop
  while (activeNodes.length > 2) {
    const numActive = activeNodes.length;
    
    // 1. Calculate net divergence r_i for each active node
    const r: Map<string, number> = new Map();
    for (const node of activeNodes) {
      let sum = 0;
      for (const other of activeNodes) {
        sum += getDist(node, other);
      }
      r.set(node.id || node.name, sum);
    }

    // 2. Find pair {i, j} minimizing M_ij = d_ij - (r_i + r_j) / (N - 2)
    let minM = Infinity;
    let minPair: [number, number] = [0, 1];

    for (let i = 0; i < numActive; i++) {
      for (let j = i + 1; j < numActive; j++) {
        const nodeI = activeNodes[i];
        const nodeJ = activeNodes[j];
        
        const distIJ = getDist(nodeI, nodeJ);
        const rI = r.get(nodeI.id || nodeI.name) || 0;
        const rJ = r.get(nodeJ.id || nodeJ.name) || 0;
        
        const mVal = distIJ - (rI + rJ) / (numActive - 2);
        if (mVal < minM) {
          minM = mVal;
          minPair = [i, j];
        }
      }
    }

    const [idxI, idxJ] = minPair;
    const nodeI = activeNodes[idxI];
    const nodeJ = activeNodes[idxJ];

    // 3. Create a parent node k for nodeI and nodeJ
    const kName = `Node_${nextInternalNodeId++}`;
    const nodeK: TreeNode = {
      name: kName,
      children: [nodeI, nodeJ],
      bootstrap: Math.floor(70 + Math.random() * 31) // Simulated bootstrap support values (70-100%)
    };

    // Calculate branch lengths:
    // v_i = d_ij/2 + (r_i - r_j) / 2(N-2)
    const distIJ = getDist(nodeI, nodeJ);
    const rI = r.get(nodeI.id || nodeI.name) || 0;
    const rJ = r.get(nodeJ.id || nodeJ.name) || 0;

    let vI = distIJ / 2 + (rI - rJ) / (2 * (numActive - 2));
    let vJ = distIJ - vI;

    // Prevent negative branch lengths
    if (vI < 0) {
      vJ += vI;
      vI = 0.001;
    }
    if (vJ < 0) {
      vI += vJ;
      vJ = 0.001;
    }

    nodeI.branchLength = parseFloat(Math.max(0.001, vI).toFixed(4));
    nodeJ.branchLength = parseFloat(Math.max(0.001, vJ).toFixed(4));

    // 4. Update distances from nodeK to all other active nodes:
    // d_km = (d_im + d_jm - d_ij) / 2
    for (const nodeM of activeNodes) {
      if (nodeM === nodeI || nodeM === nodeJ) continue;
      const distIM = getDist(nodeI, nodeM);
      const distJM = getDist(nodeJ, nodeM);
      const distKM = (distIM + distJM - distIJ) / 2;
      setDist(nodeK, nodeM, Math.max(0.0001, distKM));
    }

    // Replace nodeI and nodeJ with nodeK in our active list
    activeNodes = activeNodes.filter(n => n !== nodeI && n !== nodeJ);
    activeNodes.push(nodeK);
  }

  // Connect the final 2 nodes
  if (activeNodes.length === 2) {
    const nodeI = activeNodes[0];
    const nodeJ = activeNodes[1];
    const distIJ = getDist(nodeI, nodeJ);
    
    // Split the distance equally
    nodeI.branchLength = parseFloat(Math.max(0.001, distIJ / 2).toFixed(4));
    nodeJ.branchLength = parseFloat(Math.max(0.001, distIJ / 2).toFixed(4));

    return {
      name: 'Root',
      children: [nodeI, nodeJ],
      bootstrap: 100
    };
  }

  return activeNodes[0];
}

import { state, wait, render, updateStats} from '../controller.js';
import { highlightLine } from '../main.js';
import { playNote } from '../audio.js';

export async function mergeSort(arr, left, right, containerId, mySteps) {
    if (state.isResetting) return;
    
    // 2. Initialize tracker ONLY on the very first call
    if (!mySteps) {
        mySteps = { count: state.stepCount };
    }

    const prefix = "merge";
    
    highlightLine(prefix, 2);
    if (left >= right) return; 

    highlightLine(prefix, 3);
    let mid = Math.floor((left + right) / 2);

    highlightLine(prefix, 4); 
    // 3. Pass mySteps into recursion
    await mergeSort(arr, left, mid, containerId, mySteps);

    highlightLine(prefix, 5); 
    await mergeSort(arr, mid + 1, right, containerId, mySteps);
    
    if (state.isResetting) return; 
    
    highlightLine(prefix, 6); 
    // 4. Pass mySteps into the merge helper
    await merge(arr, left, mid, right, containerId, mySteps);
    
    highlightLine(prefix, 7);
}

async function merge(arr, start, mid, end, containerId, mySteps) {
    let leftPart = arr.slice(start, mid + 1);
    let rightPart = arr.slice(mid + 1, end + 1);

    let i = 0, j = 0, k = start;

    // Main comparison loop
    while (i < leftPart.length && j < rightPart.length) {
        if (state.isResetting) return;

        // Visual feedback
        render(arr, containerId, [start + i, mid + 1 + j]); 
        playNote(leftPart[i], 'triangle'); // Use leftPart[i] for accurate frequency

        updateStats('merge', 'comp');
        if (leftPart[i] <= rightPart[j]) {
            arr[k] = leftPart[i++];
        } else {
            arr[k] = rightPart[j++];
        }
        updateStats('merge', 'swap');
        
        k++;
        render(arr, containerId, [k-1]); // Render the placement
        await wait(mySteps); // Pause here
    }

    // 5. Cleaned up remaining element loops
    while (i < leftPart.length) {
        if (state.isResetting) return;
        updateStats('merge', 'swap');
        arr[k] = leftPart[i++];
        render(arr, containerId, [k]);
        playNote(arr[k], 'triangle');
        k++;
        await wait(mySteps);
    }

    while (j < rightPart.length) {
        if (state.isResetting) return;
        arr[k] = rightPart[j++];
        render(arr, containerId, [k]);
        playNote(arr[k], 'triangle');
        k++;
        await wait(mySteps);
    }
}

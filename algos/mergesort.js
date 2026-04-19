import { state, wait, render } from '../controller.js';
import { highlightLine } from '../main.js';
import { playNote } from '../audio.js';

export async function mergeSort(arr, left, right, containerId) {
    if (state.isResetting) return;
    const prefix = "merge";
    
    highlightLine(prefix, 2);
    if (state.isResetting ||left >= right) return; // Check for reset

    highlightLine(prefix, 3);
    let mid = Math.floor((left + right) / 2);

    highlightLine(prefix, 4); // Recursive call for left half
    await mergeSort(arr, left, mid, containerId);

    highlightLine(prefix, 5); // Recursive call for right half
    await mergeSort(arr, mid + 1, right, containerId);
    if (state.isResetting) return;  // Check for reset
    highlightLine(prefix, 6); // The actual merging happens here
    await merge(arr, left, mid, right, containerId);
    
    highlightLine(prefix, 7);
}

export async function merge(arr, start, mid, end, containerId) {
    let leftPart = arr.slice(start, mid + 1);
    let rightPart = arr.slice(mid + 1, end + 1);

    let mySteps = { count: state.stepCount };
    let i = 0, j = 0, k = start;

    while (i < leftPart.length && j < rightPart.length) {
        if (state.isResetting) return;
        // Highlight the two bars being compared in the UI
        render(arr, containerId, [start + i, mid + 1 + j]); 
        playNote(arr[j], 'triangle');

        if (leftPart[i] <= rightPart[j]) {
            arr[k] = leftPart[i++];
        } else {
            arr[k] = rightPart[j++];
        }
        await wait(mySteps);
        k++;
        render(arr, containerId); // Update UI to show the new value in the main array
    }

    // Copy remaining elements
    while (i < leftPart.length) {await wait(mySteps); arr[k++] = leftPart[i++];}
    while (j < rightPart.length) {await wait(mySteps); arr[k++] = rightPart[j++];}
    
    render(arr, containerId);
}

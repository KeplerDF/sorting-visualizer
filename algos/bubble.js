import { state, wait, render, updateStats} from '../controller.js';
import { playNote } from '../audio.js';

export async function bubbleSort(arr,containerId) {
    
    if (state.isResetting) return;
    let mySteps = { count: state.stepCount };
    
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            // Highlight the two bars being compared
            render(arr, containerId, [j, j + 1]);
            playNote(arr[j], 'sine');
            await wait(mySteps);

            updateStats('bubble', 'comp');
            if (arr[j] > arr[j + 1]) {
                updateStats('bubble', 'swap');
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                // Re-render after swap
                render(arr, containerId, [j, j + 1]);
            }
        }
    }
    // Final render with no highlights when finished
    render(arr, containerId, []);
}

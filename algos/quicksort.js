import { state, wait, render, updateStats} from '../controller.js';
import { playNote } from '../audio.js';

export async function quickSort(arr, left, right, containerId, mySteps) {
    if (!mySteps) mySteps = { count: state.stepCount }; 

    if (state.isResetting || left >= right) return;

    let index = await partition(arr, left, right, containerId, mySteps);
    
    await Promise.all([
        quickSort(arr, left, index - 1, containerId, mySteps),
        quickSort(arr, index + 1, right, containerId, mySteps)
    ]);
}

export async function partition(arr, left, right, containerId, mySteps) {
    
    let pivot = arr[right]; 
    let i = left - 1;

    for (let j = left; j <= right - 1; j++) {
        if (state.isResetting) return;
        updateStats('quick', 'comp');
        render(arr, containerId, [j, right, i]);
        playNote(arr[j], 'square');
        await wait(mySteps);

        if (arr[j] < pivot) {
            i++;
            updateStats('quick', 'swap');
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    // Swap pivot into correct place
    updateStats('quick', 'swap');
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    render(arr, containerId, [i + 1]);
    return i + 1;
}

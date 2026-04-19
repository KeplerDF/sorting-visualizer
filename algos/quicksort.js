import { state, wait, render } from '../controller.js';
import { playNote } from '../audio.js';

export async function quickSort(arr, left, right, containerId) {
    if (state.isResetting) return;
    if (left >= right) return;
    let index = await partition(arr, left, right, containerId);
    await Promise.all([
        quickSort(arr, left, index - 1, containerId),
        quickSort(arr, index + 1, right, containerId)
    ]);
}

export async function partition(arr, left, right, containerId) {
    
    // Change 'high' to 'right' and 'low' to 'left'
    let pivot = arr[right]; 
    let i = left - 1;
    let mySteps = { count: state.stepCount };

    for (let j = left; j <= right - 1; j++) {
        if (state.isResetting) return;
        // Highlight current bar (j), pivot (right), and i
        render(arr, containerId, [j, right, i]);
        playNote(arr[j], 'square');
        await wait(mySteps);

        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    // Swap pivot into correct place
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    render(arr, containerId, [i + 1]);
    return i + 1;
}

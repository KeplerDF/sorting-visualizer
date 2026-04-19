import { state, wait, render } from '../controller.js';

export async function bubbleSort(arr, id) {
    if (state.isResetting) return;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            // Highlight the two bars being compared
            render(arr, containerId, [j, j + 1]);
            await wait();

            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                // Re-render after swap
                render(arr, containerId, [j, j + 1]);
            }
        }
    }
    // Final render with no highlights when finished
    render(arr, containerId, []);
}

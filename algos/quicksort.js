import { state, wait, render } from '../controller.js';

export async function quickSort(arr, left, right, id) {
    if (state.isResetting) return;
    if (left >= right) return;
    let index = await partition(arr, left, right, id);
    await Promise.all([
        quickSort(arr, left, index - 1, id),
        quickSort(arr, index + 1, right, id)
    ]);
}

export async function partition(arr, left, right, id) {
    if (state.isResetting) return;
    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
        // Highlight current bar (j) and the pivot (high)
        render(arr, containerId, [j, high, i]);
        await wait();

        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    render(arr, containerId, [i + 1]);
    return i + 1;
}

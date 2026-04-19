import { state, wait, render } from '../controller.js';

export async function heapSort(arr, id) {
    let n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i, id);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        render(arr, id);
        await wait(); 
        await heapify(arr, i, 0, id);
    }
}

export async function heapify(arr, n, i, id) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        render(arr, id);
        await wait();
        await heapify(arr, n, largest, id);
    }
}

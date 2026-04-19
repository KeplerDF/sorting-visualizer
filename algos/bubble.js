import { render } from '../main.js';
import { state, wait } from '../controller.js';

export async function bubbleSort(arr, id) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                render(arr, id);
                
                // This is the new gatekeeper
                await wait(); 
            }
        }
    }
}

class MaxHeap {
    constructor() {
        this.heap = [];
        this.cityMap = new Map();  // Keep track of city and its index in the heap
    }

    // Insert or update a city into the heap
    insert(cityKey, priority) {
        if (this.cityMap.has(cityKey)) {
            // If city already exists, increase the priority
            const index = this.cityMap.get(cityKey);
            this.heap[index].priority += priority;  // Increase the priority
            this.bubbleUp(index);  // Adjust the heap structure after priority update
        } else {
            // Insert new city with priority
            this.heap.push({ cityKey, priority });
            this.cityMap.set(cityKey, this.heap.length - 1);  // Store index of city
            this.bubbleUp(this.heap.length - 1);  // Adjust heap
        }
    }

    // Bubble up to maintain heap property
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].priority <= this.heap[parentIndex].priority) break;

            // Swap the current node with its parent
            this.swap(index, parentIndex);

            // Update cityMap
            this.cityMap.set(this.heap[index].cityKey, index);
            this.cityMap.set(this.heap[parentIndex].cityKey, parentIndex);

            index = parentIndex;
        }
    }

    // Remove the top city (highest priority)
    removeTop() {
        if (this.heap.length === 0) return null;

        const top = this.heap[0];
        const end = this.heap.pop();

        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.cityMap.set(end.cityKey, 0);
            this.sinkDown(0);  // Adjust the heap structure
        }

        this.cityMap.delete(top.cityKey);  // Remove from cityMap
        return top;
    }

    // Sink down to maintain heap property
    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];

        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild.priority > element.priority) {
                    swap = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && rightChild.priority > element.priority) ||
                    (swap !== null && rightChild.priority > leftChild.priority)
                ) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) break;

            this.swap(index, swap);

            // Update cityMap
            this.cityMap.set(this.heap[index].cityKey, index);
            this.cityMap.set(this.heap[swap].cityKey, swap);

            index = swap;
        }
    }

    // Swap two elements in the heap
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Get top cities
    getTopCities(limit = 3) {
        const result = [];
        for (let i = 0; i < limit && this.heap.length > 0; i++) {
            const city = this.removeTop();
            if (city) result.push(city.cityKey);
        }
        return result;
    }
}

// Example usage
const cityHeap = new MaxHeap();
const cache = {};

// Add initial cities or update priority
cityHeap.insert('india_madhya-pradesh_bhopal', 1);
cityHeap.insert('india_maharashtra_mumbai', 1);
cityHeap.insert('india_delhi_new-delhi', 1);

// Increase the priority of a city
cityHeap.insert('india_madhya-pradesh_bhopal', 2);  // Increases priority of Bhopal

// Update priority
function updatePriority(cityKey, newPriority) {
    cityHeap.insert(cityKey, newPriority);
}

// Get top cities
function getTopCities(limit = 3) {
    return cityHeap.getTopCities(limit);
}

module.exports = { cache, updatePriority, getTopCities };

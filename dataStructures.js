export class OptimizedQueue {
    constructor() {
        this.items = {}; // Use an object for O(1) lookups
        this.headIndex = 0;
        this.tailIndex = 0;
    }

    // Add element to the tail (O(1))
    enqueue(element) {
        this.items[this.tailIndex] = element;
        this.tailIndex++;
    }

    // Remove element from the head (O(1))
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        const element = this.items[this.headIndex];
        delete this.items[this.headIndex];
        this.headIndex++;
        return element;
    }

    peek() {
        return this.items[this.headIndex];
    }

    isEmpty() {
        return this.headIndex === this.tailIndex;
    }

    size() {
        return this.tailIndex - this.headIndex;
    }
}

export class SimpleStack {
    constructor() {
        this.items = [];
    }
    push(element) {
        this.items.push(element);
    }
    pop() {
        return this.items.pop();
    }
}
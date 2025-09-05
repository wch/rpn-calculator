export class RPNCalculator {
  private stack: number[] = [];
  private errorMessage: string | null = null;

  getStack(): number[] {
    return [...this.stack]; // Return a copy to prevent mutation
  }

  getError(): string | null {
    return this.errorMessage;
  }

  clearError(): void {
    this.errorMessage = null;
  }

  push(value: string): boolean {
    try {
      const num = parseFloat(value);
      if (isNaN(num)) {
        this.errorMessage = `Invalid number: ${value}`;
        return false;
      }
      this.stack.push(num);
      this.errorMessage = null;
      return true;
    } catch (error) {
      this.errorMessage = `Invalid number: ${value}`;
      return false;
    }
  }

  pop(): number | null {
    if (this.stack.length === 0) {
      this.errorMessage = "Stack empty";
      return null;
    }
    this.errorMessage = null;
    return this.stack.pop()!;
  }

  peek(): number | null {
    if (this.stack.length === 0) {
      return null;
    }
    return this.stack[this.stack.length - 1];
  }

  clear(): void {
    this.stack = [];
    this.errorMessage = null;
  }

  drop(): void {
    if (this.stack.length > 0) {
      this.stack.pop();
      this.errorMessage = null;
    } else {
      this.errorMessage = "Stack empty";
    }
  }

  duplicate(): void {
    if (this.stack.length > 0) {
      this.stack.push(this.stack[this.stack.length - 1]);
      this.errorMessage = null;
    } else {
      this.errorMessage = "Stack empty - nothing to duplicate";
    }
  }

  swap(): void {
    if (this.stack.length < 2) {
      this.errorMessage = "Need at least 2 values on stack";
      return;
    }

    const val1 = this.stack.pop()!;
    const val2 = this.stack.pop()!;
    this.stack.push(val1);
    this.stack.push(val2);
    this.errorMessage = null;
  }

  operation(op: string): void {
    if (op === "swap") {
      this.swap();
      return;
    }

    if (op === "sqrt") {
      if (this.stack.length < 1) {
        this.errorMessage = "Need at least 1 value for sqrt";
        return;
      }

      const a = this.stack.pop()!;
      if (a < 0) {
        this.errorMessage = "Cannot take square root of negative number";
        this.stack.push(a);
        return;
      }

      try {
        const result = Math.sqrt(a);
        this.stack.push(result);
        this.errorMessage = null;
      } catch (error) {
        this.errorMessage = String(error);
        this.stack.push(a);
      }
      return;
    }

    if (op === "pow") {
      if (this.stack.length < 1) {
        this.errorMessage = "Need at least 1 value for power";
        return;
      }

      const a = this.stack.pop()!;
      try {
        const result = a * a; // x²
        this.stack.push(result);
        this.errorMessage = null;
      } catch (error) {
        this.errorMessage = String(error);
        this.stack.push(a);
      }
      return;
    }

    // Binary operations
    if (op === "+" || op === "-" || op === "*" || op === "/") {
      if (this.stack.length < 2) {
        this.errorMessage = `Need at least 2 values for ${op}`;
        return;
      }

      const b = this.stack.pop()!;
      const a = this.stack.pop()!;

      try {
        let result: number;
        switch (op) {
          case "+":
            result = a + b;
            break;
          case "-":
            result = a - b;
            break;
          case "*":
            result = a * b;
            break;
          case "/":
            if (b === 0) {
              this.errorMessage = "Division by zero";
              this.stack.push(a);
              this.stack.push(b);
              return;
            }
            result = a / b;
            break;
          default:
            this.errorMessage = `Unknown operation: ${op}`;
            this.stack.push(a);
            this.stack.push(b);
            return;
        }

        this.stack.push(result);
        this.errorMessage = null;
      } catch (error) {
        this.errorMessage = String(error);
        this.stack.push(a);
        this.stack.push(b);
      }
      return;
    }

    this.errorMessage = `Unknown operation: ${op}`;
  }
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect, useRef } from "react";
import { RPNCalculator } from "../RPNCalculator";

export function App() {
  const calculatorRef = useRef(new RPNCalculator());
  const [currentInput, setCurrentInput] = useState<string>("");
  const [displayStack, setDisplayStack] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Force re-render when calculator state changes
  const updateDisplay = () => {
    setDisplayStack(calculatorRef.current.getStack());
    setErrorMessage(calculatorRef.current.getError());
  };

  // Initialize display on mount
  useEffect(() => {
    updateDisplay();
  }, []);

  const handleDigit = (digit: string) => {
    if (digit === "." && currentInput.includes(".")) return;
    setCurrentInput(prev => prev + digit);
  };

  const handleOperation = (op: string) => {
    if (currentInput && currentInput !== "") {
      // Push the current input to the stack first, then perform the operation
      calculatorRef.current.push(currentInput);
      setCurrentInput("");
      calculatorRef.current.operation(op);
    } else {
      // No current input, just perform the operation on stack values
      calculatorRef.current.operation(op);
    }
    updateDisplay();
  };

  const handleEnter = () => {
    if (currentInput && currentInput !== "") {
      // Push the current input to the stack
      calculatorRef.current.push(currentInput);
      setCurrentInput("");
    } else {
      // If no input, duplicate the top stack value (traditional RPN behavior)
      calculatorRef.current.duplicate();
    }
    updateDisplay();
  };

  const handleClear = () => {
    setCurrentInput("");
    calculatorRef.current.clear();
    updateDisplay();
  };

  const handleDrop = () => {
    calculatorRef.current.drop();
    updateDisplay();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setCurrentInput(value);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleEnter();
    }
  };

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent handling if user is typing in the input field
      if (event.target instanceof HTMLInputElement) {
        return;
      }

      const key = event.key;

      // Numbers
      if (key >= '0' && key <= '9') {
        event.preventDefault();
        handleDigit(key);
      }
      // Decimal point
      else if (key === '.') {
        event.preventDefault();
        handleDigit('.');
      }
      // Operations
      else if (key === '+') {
        event.preventDefault();
        handleOperation('+');
      }
      else if (key === '-') {
        event.preventDefault();
        handleOperation('-');
      }
      else if (key === '*') {
        event.preventDefault();
        handleOperation('*');
      }
      else if (key === '/') {
        event.preventDefault();
        handleOperation('/');
      }
      // Enter key
      else if (key === 'Enter') {
        event.preventDefault();
        handleEnter();
      }
      // Backspace to delete last digit from current input
      else if (key === 'Backspace') {
        event.preventDefault();
        setCurrentInput(prev => prev.slice(0, -1));
      }
      // Delete key for drop (remove from stack)
      else if (key === 'Delete') {
        event.preventDefault();
        handleDrop();
      }
      // Escape for clear
      else if (key === 'Escape') {
        event.preventDefault();
        handleClear();
      }
      // 's' for square root
      else if (key.toLowerCase() === 's') {
        event.preventDefault();
        handleOperation('sqrt');
      }
      // 'p' for power/square
      else if (key.toLowerCase() === 'p') {
        event.preventDefault();
        handleOperation('pow');
      }
      // 'w' for swap
      else if (key.toLowerCase() === 'w') {
        event.preventDefault();
        handleOperation('swap');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentInput]); // Include currentInput in dependencies

  return (
    <div className='h-dvh w-full bg-background p-2 sm:p-4 sm:min-h-dvh overflow-hidden'>
      <div className='h-full w-full max-w-md mx-auto flex flex-col'>
        <Card className='flex-1 flex flex-col h-full overflow-hidden'>
          <CardHeader className='flex-shrink-0 pt-3 pb-0'>
            <CardTitle className="text-center">RPN Calculator</CardTitle>
          </CardHeader>
          <CardContent className='flex-1 flex flex-col p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden'>
            {/* Stack Display */}
            <div className='flex-shrink-0 space-y-2'>
              <label className='text-sm font-medium'>Stack:</label>
              <div className='bg-muted p-2 sm:p-3 rounded-md h-25 sm:min-h-[120px] font-mono overflow-y-auto'>
                {displayStack && displayStack.length > 0 ? (
                  <div className='space-y-1'>
                    {displayStack.slice(-4).reverse().map((value, index) => (
                      <div key={index} className={`text-sm ${index === 0 ? 'font-bold' : ''}`}>
                        {displayStack.length - index}: {value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-sm text-muted-foreground'>Stack empty</div>
                )}
              </div>
            </div>

            {/* Current Input */}
            <div className='flex-shrink-0 space-y-2'>
              <label htmlFor='number-input' className='text-sm font-medium'>
                Enter Number:
              </label>
              <Input
                id='number-input'
                type='text'
                inputMode='decimal'
                value={currentInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder='0'
                className='font-mono text-right text-2xl sm:text-3xl h-10 sm:h-12'
              />
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className='flex-shrink-0 bg-destructive/10 border border-destructive/20 p-2 rounded-md'>
                <span className='text-xs sm:text-sm text-destructive'>{errorMessage}</span>
              </div>
            )}

            <Separator className='flex-shrink-0' />

            {/* Calculator Layout */}
            <div className='flex-1 flex flex-col space-y-2 sm:space-y-3 min-h-0'>
              {/* Number pad with operations on the right */}
              <div className='grid grid-cols-4 gap-1 sm:gap-2'>
                <Button variant="outline" onClick={() => handleDigit("7")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>7</Button>
                <Button variant="outline" onClick={() => handleDigit("8")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>8</Button>
                <Button variant="outline" onClick={() => handleDigit("9")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>9</Button>
                <Button variant="secondary" onClick={() => handleOperation("/")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>/</Button>

                <Button variant="outline" onClick={() => handleDigit("4")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>4</Button>
                <Button variant="outline" onClick={() => handleDigit("5")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>5</Button>
                <Button variant="outline" onClick={() => handleDigit("6")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>6</Button>
                <Button variant="secondary" onClick={() => handleOperation("*")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>×</Button>

                <Button variant="outline" onClick={() => handleDigit("1")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>1</Button>
                <Button variant="outline" onClick={() => handleDigit("2")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>2</Button>
                <Button variant="outline" onClick={() => handleDigit("3")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>3</Button>
                <Button variant="secondary" onClick={() => handleOperation("-")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>−</Button>

                <Button variant="outline" onClick={() => handleDigit("0")} className='col-span-2 h-10 sm:h-12 text-base sm:text-lg font-semibold'>0</Button>
                <Button variant="outline" onClick={() => handleDigit(".")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>.</Button>
                <Button variant="secondary" onClick={() => handleOperation("+")} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>+</Button>
              </div>

              {/* Enter and special operations */}
              <div className='grid grid-cols-2 gap-1 sm:gap-2'>
                <Button variant="outline" onClick={handleDrop} className='h-10 sm:h-12 text-base sm:text-lg font-semibold'>Drop</Button>
                <Button onClick={handleEnter} className='bg-primary text-primary-foreground h-10 sm:h-12 text-base sm:text-lg font-semibold'>
                  Enter
                </Button>
              </div>

              {/* Advanced Operations */}
              <div className='grid grid-cols-3 gap-1 sm:gap-2'>
                <Button variant="secondary" onClick={() => handleOperation("sqrt")} className='h-8 sm:h-10 text-sm sm:text-base font-semibold'>√</Button>
                <Button variant="secondary" onClick={() => handleOperation("pow")} className='h-8 sm:h-10 text-sm sm:text-base font-semibold'>x²</Button>
                <Button variant="secondary" onClick={() => handleOperation("swap")} className='h-8 sm:h-10 text-sm sm:text-base font-semibold'>Swap</Button>
              </div>

              {/* Clear button */}
              <Button variant="destructive" onClick={handleClear} className='w-full h-8 sm:h-10 text-sm sm:text-base font-semibold'>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

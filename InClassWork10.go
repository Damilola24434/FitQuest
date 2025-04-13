package main

import (
	"fmt"
)

func Sum(numbers *[]float64) float64 {
	Sumtotal := 0.0
	for _, num := range *numbers {
		Sumtotal += num
	}
	return Sumtotal
}

func main() {
	// Test case
	numbers := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
	answer := Sum(&numbers)
	fmt.Printf("The sum of the floating numbers is: %.3f\n", answer)
}

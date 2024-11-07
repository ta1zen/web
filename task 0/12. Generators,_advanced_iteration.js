//Generators
    //Task 1
        function pseudoRandom(seed) {
            let value = seed;
        
            return function() {
            value = value * 16807 % 2147483647;
            return value;
            }
        }
        
        let generator = pseudoRandom(1);
        
        alert(generator()); // 16807
        alert(generator()); // 282475249
        alert(generator()); // 1622650073
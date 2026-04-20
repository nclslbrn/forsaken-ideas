const hash13 = (p) => {
  let p3 = [
    (p[0] * 0.1031) % 1,
    (p[1] * 0.1031) % 1,
    (p[2] * 0.1031) % 1
  ];
  
  const dotProduct = p3[0] * p3[2] + 
                     p3[1] * p3[0] + 
                     p3[2] * p3[1] + 
                     31.32;
  
  p3[0] += dotProduct;
  p3[1] += dotProduct;
  p3[2] += dotProduct;
  
  return ((p3[0] + p3[1]) * p3[2]) % 1;
}

export { hash13 }

/**
 * PerspectiveTransform - A JavaScript class for creating and applying perspective transforms
 *
 * Maps one 2D quadrilateral to another using homographic matrices.
 * Based on the perspective-transform npm package functionality.
 */
export default class PerspectiveTransform {
    /**
     * Create a perspective transform
     * @param {number[]} srcCorners - Array of 8 numbers [x1,y1,x2,y2,x3,y3,x4,y4] representing source quad corners
     * @param {number[]} dstCorners - Array of 8 numbers [x1,y1,x2,y2,x3,y3,x4,y4] representing destination quad corners
     */
    constructor(srcCorners, dstCorners) {
        if (
            !srcCorners ||
            !dstCorners ||
            srcCorners.length !== 8 ||
            dstCorners.length !== 8
        ) {
            throw new Error(
                'Both srcCorners and dstCorners must be arrays of 8 numbers'
            )
        }

        this._srcPts = [...srcCorners]
        this._dstPts = [...dstCorners]

        // Calculate transform matrices
        this._coeffs = this._calculateTransformMatrix(srcCorners, dstCorners)
        this._coeffsInv = this._calculateTransformMatrix(dstCorners, srcCorners)
    }

    /**
     * Get source quadrilateral corners
     * @returns {number[]} Array of 8 numbers representing source corners
     */
    get srcPts() {
        return [...this._srcPts]
    }

    /**
     * Get destination quadrilateral corners
     * @returns {number[]} Array of 8 numbers representing destination corners
     */
    get dstPts() {
        return [...this._dstPts]
    }

    /**
     * Get homographic transform matrix coefficients
     * @returns {number[]} Array of 9 matrix coefficients
     */
    get coeffs() {
        return [...this._coeffs]
    }

    /**
     * Get inverse homographic transform matrix coefficients
     * @returns {number[]} Array of 9 inverse matrix coefficients
     */
    get coeffsInv() {
        return [...this._coeffsInv]
    }

    /**
     * Transform a point from source to destination quadrilateral
     * @param {number[]} point - [x, y] coordinates in source quad
     * @returns {number[]} [x, y] coordinates in destination quad
     */
    transform(point) {
        if (!point || point.length !== 2) {
            throw new Error('Point must be an array of 2 numbers [x, y]')
        }

        return this._applyTransform(point, this._coeffs)
    }

    /**
     * Transform a point from destination to source quadrilateral (inverse transform)
     * @param {number[]} point - [x, y] coordinates in destination quad
     * @returns {number[]} [x, y] coordinates in source quad
     */
    transformInverse(point) {
        if (!point || point.length !== 2) {
            throw new Error('Point must be an array of 2 numbers [x, y]')
        }

        return this._applyTransform(point, this._coeffsInv)
    }

    /**
     * Calculate the homographic transform matrix between two quadrilaterals
     * @private
     * @param {number[]} src - Source quadrilateral corners [x1,y1,x2,y2,x3,y3,x4,y4]
     * @param {number[]} dst - Destination quadrilateral corners [x1,y1,x2,y2,x3,y3,x4,y4]
     * @returns {number[]} Transform matrix coefficients
     */
    _calculateTransformMatrix(src, dst) {
        // Extract corner coordinates
        const [x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s] = src
        const [x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d] = dst

        // Set up the system of equations for homographic transform
        // We need to solve for 8 unknowns in the 3x3 homography matrix
        const A = [
            [x1s, y1s, 1, 0, 0, 0, -x1d * x1s, -x1d * y1s],
            [0, 0, 0, x1s, y1s, 1, -y1d * x1s, -y1d * y1s],
            [x2s, y2s, 1, 0, 0, 0, -x2d * x2s, -x2d * y2s],
            [0, 0, 0, x2s, y2s, 1, -y2d * x2s, -y2d * y2s],
            [x3s, y3s, 1, 0, 0, 0, -x3d * x3s, -x3d * y3s],
            [0, 0, 0, x3s, y3s, 1, -y3d * x3s, -y3d * y3s],
            [x4s, y4s, 1, 0, 0, 0, -x4d * x4s, -x4d * y4s],
            [0, 0, 0, x4s, y4s, 1, -y4d * x4s, -y4d * y4s]
        ]

        const b = [x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d]

        // Solve the linear system using Gaussian elimination
        const solution = this._solveLinearSystem(A, b)

        // The homography matrix is:
        // [a, b, c]
        // [d, e, f]
        // [g, h, 1]
        return [
            solution[0],
            solution[1],
            solution[2],
            solution[3],
            solution[4],
            solution[5],
            solution[6],
            solution[7],
            1
        ]
    }

    /**
     * Apply a homographic transform to a point
     * @private
     * @param {number[]} point - [x, y] coordinates
     * @param {number[]} matrix - 9-element transform matrix
     * @returns {number[]} Transformed [x, y] coordinates
     */
    _applyTransform(point, matrix) {
        const [x, y] = point
        const [a, b, c, d, e, f, g, h, i] = matrix

        // Apply homographic transformation
        const denominator = g * x + h * y + i

        if (Math.abs(denominator) < 1e-10) {
            throw new Error('Transform resulted in division by zero')
        }

        const transformedX = (a * x + b * y + c) / denominator
        const transformedY = (d * x + e * y + f) / denominator

        return [transformedX, transformedY]
    }

    /**
     * Solve a linear system Ax = b using Gaussian elimination with partial pivoting
     * @private
     * @param {number[][]} A - Coefficient matrix
     * @param {number[]} b - Right-hand side vector
     * @returns {number[]} Solution vector
     */
    _solveLinearSystem(A, b) {
        const n = A.length
        const augmented = A.map((row, i) => [...row, b[i]])

        // Forward elimination with partial pivoting
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i
            for (let j = i + 1; j < n; j++) {
                if (
                    Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])
                ) {
                    maxRow = j
                }
            }

            // Swap rows
            if (maxRow !== i) {
                ;[augmented[i], augmented[maxRow]] = [
                    augmented[maxRow],
                    augmented[i]
                ]
            }

            // Check for singular matrix
            if (Math.abs(augmented[i][i]) < 1e-10) {
                throw new Error('Matrix is singular or nearly singular')
            }

            // Eliminate column
            for (let j = i + 1; j < n; j++) {
                const factor = augmented[j][i] / augmented[i][i]
                for (let k = i; k <= n; k++) {
                    augmented[j][k] -= factor * augmented[i][k]
                }
            }
        }

        // Back substitution
        const solution = new Array(n)
        for (let i = n - 1; i >= 0; i--) {
            solution[i] = augmented[i][n]
            for (let j = i + 1; j < n; j++) {
                solution[i] -= augmented[i][j] * solution[j]
            }
            solution[i] /= augmented[i][i]
        }

        return solution
    }

    /**
     * Get CSS transform string for applying this perspective transform to DOM elements
     * @returns {string} CSS transform matrix3d string
     */
    getCSSTransform() {
        const [a, b, c, d, e, f, g, h, i] = this._coeffs

        // Convert to CSS matrix3d format (4x4 matrix)
        // For 2D perspective transforms, we use:
        // [a, d, 0, g]
        // [b, e, 0, h]
        // [0, 0, 1, 0]
        // [c, f, 0, i]
        return `matrix3d(${a}, ${d}, 0, ${g}, ${b}, ${e}, 0, ${h}, 0, 0, 1, 0, ${c}, ${f}, 0, ${i})`
    }

    /**
     * Create a PerspectiveTransform from corner points objects
     * @static
     * @param {Object} srcCorners - Source corners {topLeft: [x,y], topRight: [x,y], bottomRight: [x,y], bottomLeft: [x,y]}
     * @param {Object} dstCorners - Destination corners with same structure
     * @returns {PerspectiveTransform} New transform instance
     */
    static fromCornerPoints(srcCorners, dstCorners) {
        const srcArray = [
            ...srcCorners.topLeft,
            ...srcCorners.topRight,
            ...srcCorners.bottomRight,
            ...srcCorners.bottomLeft
        ]

        const dstArray = [
            ...dstCorners.topLeft,
            ...dstCorners.topRight,
            ...dstCorners.bottomRight,
            ...dstCorners.bottomLeft
        ]

        return new PerspectiveTransform(srcArray, dstArray)
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerspectiveTransform
} else if (typeof window !== 'undefined') {
    window.PerspectiveTransform = PerspectiveTransform
}

// Example usage:
/*
// Basic usage
const srcCorners = [158, 64, 494, 69, 495, 404, 158, 404];
const dstCorners = [100, 500, 152, 564, 148, 604, 100, 560];
const perspT = new PerspectiveTransform(srcCorners, dstCorners);

// Transform a point
const srcPt = [250, 120];
const dstPt = perspT.transform(srcPt);
console.log(dstPt); // [117.27521125839255, 530.9202410878403]

// Inverse transform
const originalPt = perspT.transformInverse(dstPt);
console.log(originalPt); // Should be close to [250, 120]

// Get matrix coefficients
console.log(perspT.coeffs);
console.log(perspT.coeffsInv);

// Alternative constructor with corner objects
const transform = PerspectiveTransform.fromCornerPoints(
    {
        topLeft: [0, 0],
        topRight: [100, 0], 
        bottomRight: [100, 100],
        bottomLeft: [0, 100]
    },
    {
        topLeft: [10, 10],
        topRight: [90, 5],
        bottomRight: [95, 95], 
        bottomLeft: [5, 90]
    }
);
*/

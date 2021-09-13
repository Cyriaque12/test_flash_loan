pragma solidity = 0.8.7;


import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IERC20.sol";
//import './libraries/TransferHelper.sol';
import "./libraries/UniswapV2Library.sol";


contract Arbitrage {
    address public factory;
    
    struct SwapCallBackData {
        address[] path;
        uint256[] amounts;
        address[] factories;
    }
    

    SwapCallBackData private callBackData;
    
    event LoggerInt(uint entier, string message);

    function setFactory(address _factory) internal {
        // require check on addresss
        factory = _factory;
    }

    function startArbitrage(address[] memory _path, uint256[] memory _amounts, address[] memory _factories) external {
        setFactory(_factories[0]);

        address pair12 = IUniswapV2Factory(factory).getPair(_path[0], _path[1]);
        (address tokenA,) = UniswapV2Library.sortTokens(_path[0], _path[1]);
        
        require(pair12 != address(0), "first pair does not exist");
        (uint amount0Out, uint amount1Out) = _path[0] == tokenA ? (uint(0), _amounts[1]) : (_amounts[1], uint(0));
        
        IUniswapV2Pair(pair12).swap(
                        amount0Out,
                        amount1Out,
                        address(this),
                        abi.encode(
                            SwapCallBackData({
                                path:_path,
                                amounts:_amounts,
                                factories:_factories
                            })
                            )
            );
    }

    function checkIfRentable(
        uint[] memory amounts,
        address[] memory path, 
        address[] memory factories)
        internal returns (bool rentable) 
    {

    }



    function _swap(uint[] memory amounts, address[] memory path, address[] memory factories) internal virtual {
        // Skipping first swap in path because already done in StartArbitrage function
        for (uint i=1; i < path.length - 1; i++) {
            
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            
            // Adress of nextPair, use factory of next pair
            address to;
            if (i < path.length - 2) {
                setFactory(factories[i+1]);
                to = UniswapV2Library.pairFor(factory, output, path[i + 2]);
            }
            else {
                to = address(this);
            }
            
            // Use current factory to execute swap
            setFactory(factories[i]);
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
            
            emit LoggerInt(0, "swap done");
        }
    }

    function uniswapV2Call(
            address _sender, 
            uint _amount0, 
            uint _amount1, 
            bytes calldata _data
        ) external {
            // Decode callback data
            SwapCallBackData memory decoded = abi.decode(_data, (SwapCallBackData));
            // Send first amount to pair
            setFactory(decoded.factories[1]);
            address pair = IUniswapV2Factory(factory).getPair(decoded.path[1], decoded.path[2]);
            IERC20(decoded.path[1]).transfer(pair, decoded.amounts[1]);
            // Execute all swaps
            _swap(decoded.amounts, decoded.path, decoded.factories);
            
            // return first funds
            IERC20(decoded.path[0]).transfer(msg.sender, decoded.amounts[0]);
            
            // get benefice
            IERC20(decoded.path[0]).transfer(tx.origin, decoded.amounts[decoded.amounts.length-1]-decoded.amounts[0]);
 
    }
}
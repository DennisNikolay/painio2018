import * as React from "react";
import { ServerDrawingCanvas } from './ServerDrawingCanvas';
import { CLIENT_MESSAGES } from '../constants/ProtocolMessages';
import { Toolbar } from '../components/Toolbar';
import { ColorResult } from "react-color";


export class ClientDrawingCanvas extends ServerDrawingCanvas{

    constructor(props: any){
        super(props);
    }



    componentDidMount(){
        super.componentDidMount();
        this.props.socket.send(
            CLIENT_MESSAGES.CLIENT_DRAW_MESSAGES.CHANGE_TOOL.concat(
                JSON.stringify(this.state.drawTools.find((tool) => tool.user == this.props.user_id))
            )
        );
    }
    
    componentWillUpdate(){
        let countDrawPoints = this.state.drawPoints.length;
        if(this.state.mouseBtnPressed == false){
            if(countDrawPoints == 1){
                this.props.socket.send(
                    CLIENT_MESSAGES.CLIENT_DRAW_MESSAGES.DRAW_DOT.concat
                    (
                        JSON.stringify(
                            {
                                user: this.props.user_id,
                                p: this.state.drawPoints[0], 
                            }
                        )
                    )
                );
                this.setState({drawPoints: []});
            }
        }
        if(countDrawPoints>1){
            for(let i = 0; i<countDrawPoints-1; i++){
                this.props.socket.send(
                    CLIENT_MESSAGES.CLIENT_DRAW_MESSAGES.DRAW_LINE.concat
                    (
                        JSON.stringify(
                            {
                                user: this.props.user_id,
                                p: this.state.drawPoints[i], 
                                q: this.state.drawPoints[i+1]
                            }
                        )
                    )
                );
            }
            let lastPoint = this.state.drawPoints[countDrawPoints-1];
            this.setState({drawPoints: [lastPoint]});
        }
    }

    componentDidUpdate(){
        /*this.props.socket.send(
            CLIENT_MESSAGES.CLIENT_DRAW_MESSAGES.CHANGE_TOOL.concat(
                JSON.stringify(this.state.drawTool)
            )
        );*/
    }

    render(){

        const onChangeColor = (color: ColorResult) => {
            let ownIndex = this.state.drawTools.findIndex((drawTool) => drawTool.user == this.props.user_id);
            let copy = this.state.drawTools[ownIndex];
            copy.color = color.hex;
            let newDrawTools = this.state.drawTools;
            newDrawTools[ownIndex] = copy;
            this.props.socket.send(
                CLIENT_MESSAGES.CLIENT_DRAW_MESSAGES.CHANGE_TOOL.concat
                (
                    JSON.stringify(
                        {
                            user: this.props.user_id,
                            ...newDrawTools[ownIndex]
                        }
                    )
                )
            );
            this.setState({
                drawTools: newDrawTools
            });
        };
        let ownTool = this.state.drawTools.find((drawTool) => {
            return drawTool.user == this.props.user_id
        });
        if(ownTool == undefined){
            throw new DOMException("own drawing tool should be defined");
        }
        return (
            <div>
                <canvas
                    ref={(canvasElement) => {this.canvas = canvasElement}}
                    width={this.props.width}
                    height={this.props.height}
                    onMouseDown={
                        (e) => {
                            e.preventDefault();
                            this.setState(
                                {
                                    mouseBtnPressed: true, 
                                    drawPoints:[{x:e.clientX, y:e.clientY}]
                                }
                            );
                        }
                    }
                    onMouseMove={
                        (e) => {
                            e.preventDefault();
                            if(this.state.mouseBtnPressed){
                                let newDrawPoints = Array.from(this.state.drawPoints.concat({x: e.clientX, y: e.clientY}));
                                this.setState({mouseBtnPressed:true, drawPoints: newDrawPoints})
                            }
                        }
                    }
                    onMouseOut={
                        (e) => {
                            e.preventDefault();
                            this.setState({mouseBtnPressed: false});
                        }
                    }
                    onMouseUp={
                        (e) => {
                            e.preventDefault();
                            this.setState({mouseBtnPressed: false});
                        }
                    }
                    style={{border: "1px solid black"}}
                />
                <Toolbar onColorChangeComplete={onChangeColor} color={ownTool.color}/>
            </div>
        );
    }

}
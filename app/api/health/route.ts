export function GET(){return Response.json({status:'ok',service:'nabocadopovo-eleicoes',checkedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});}

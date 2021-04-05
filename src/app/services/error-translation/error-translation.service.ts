import { Injectable } from '@angular/core';
import { UserPrefService } from '../user-pref/user-pref.service';
// tslint:disable: quotemark
// tslint:disable: object-literal-key-quotes
// tslint:disable: max-line-length

@Injectable({
  providedIn: 'root'
})
export class ErrorTranslationService {

  data: {key: string, en?: string, es?: string, pt?: string}[] = [
    {
      "key": "sessionExpired",
      "en": "The session has expired, click OK to be redirected to the login page.",
      "es": "La sesión ha expirado, haga clic en OK para ser redirigido a la página de inicio de sesión.",
      "pt": "A sessão expirou, clique OK para ser redirecionado para a página de login."
    },
    {
      "key": "upto",
      "en": "Up to",
      "es": "Hasta",
      "pt": "Até"
    }, {
      "key": "Total Cost",
      "en": "Total Cost",
      "es": "Costo Total",
      "pt": "Custo total"
    }, {
      "key": "Approver",
      "en": "Approver",
      "es": "Aprobador",
      "pt": "Aprovador"
    }, {
      "key": "Profit Center",
      "en": "Profit Center",
      "es": "Centro de Benificio",
      "pt": "Centro de lucro"
    }, {
      "key": "Internal Order",
      "en": "Internal Order",
      "es": "Orden Interna",
      "pt": "Ordem interna"
    }, {
      "key": "Asset Type",
      "en": "Asset Type",
      "es": "Tipo de Activo",
      "pt": "Tipo do ativo"
    }, {
      "key": "Cost Center",
      "en": "Cost Center",
      "es": "BorrCentro de Costesador",
      "pt": "Centro de custo"
    }, {
      "key": "GL Account",
      "en": "GL Account",
      "es": "Cuenta Contable",
      "pt": "Conta contábil"
    }, {
      "key": "Cost Object Information",
      "en": "Cost Object Information",
      "es": "Información de Costo",
      "pt": "Objeto de custo"
    }, {
      "key": "Price Unit",
      "en": "Price Unit",
      "es": "Precio Unitario",
      "pt": "Preço unitário"
    }, {
      "key": "Unit Cost",
      "en": "Unit Cost",
      "es": "COSTO UNITARIO",
      "pt": "Custo unitário"
    }, {
      "key": "Delivery Date",
      "en": "Delivery Date",
      "es": "Fecha de Entrega",
      "pt": "Data de remessa"
    }, {
      "key": "UOM",
      "en": "UOM",
      "es": "UM",
      "pt": "UM"
    }, {
      "key": "Qty",
      "en": "Qty",
      "es": "CANTIDAD",
      "pt": "Qtde"
    }, {
      "key": "Description",
      "en": "Description",
      "es": "DESCRIPCIÓN DEL ÍTEM",
      "pt": "Descrição"
    }, {
      "key": "Line Item",
      "en": "Line Item ",
      "es": "Línea ",
      "pt": "Linha "
    }, {
      "key": "Purchase End Date",
      "en": "Purchase End Date",
      "es": "Fecha Fin",
      "pt": "Data de término da compra"
    }, {
      "key": "Contract End Date",
      "en": "Contract End Date",
      "es": "Contrato: Fecha Fin",
      "pt": "Data de término do contrato"
    }, {
      "key": "Purchase Start Date",
      "en": "Purchase Start Date",
      "es": "Fecha Inicio",
      "pt": "Data de início da compra"
    }, {
      "key": "Contract Start Date",
      "en": "Contract Start Date",
      "es": "Contrato: Fecha Inicio",
      "pt": "Data de início do contrato"
    }, {
      "key": "Order Currency",
      "en": "Order Currency",
      "es": "MON SOC",
      "pt": "Moeda da solicitação"
    }, {
      "key": "Vendor",
      "en": "Vendor",
      "es": "Proveedor",
      "pt": "Fornecedor"
    }, {
      "key": "Buyer",
      "en": "Buyer",
      "es": "Comprador",
      "pt": "Comprador"
    }, {
      "key": "Attention To",
      "en": "Attention To",
      "es": "Atenção (Fornecedor)",
      "pt": "Atención"
    }, {
      "key": "Select a vendor!",
      "en": "Select a vendor!",
      "es": "¡Seleccione un proveedor!",
      "pt": "selecione um fornecedor!"
    }, {
      "key": "problemToDelete",
      "en": "There was a problem deleting your request.",
      "es": "Hubo un problema al eliminar su solicitud.",
      "pt": "Ocorreu um problema ao excluir sua solicitação."
    }, {
      "key": "haveAuth",
      "en": "You already have the selected authorization for this region.",
      "es": "Usted ya tiene autorización para la región seleccionada.",
      "pt": "Você já tem a autorização selecionada para esta região."
    }, {
      "key": "spclFuncBlank",
      "en": "You have left a special functional authority field blank. Please change it or remove it with the delete button.",
      "es": 'Ha dejado en blanco un campo de "Nivel de Autoridad". Por favor complételo o elimínelo con el botón Eliminar.',
      "pt": "Você deixou um campo de autoridade funcional especial em branco. Por favor altere ou remova ele com o botão excluir."
    }, {
      "key": "sameCat",
      "en": "Your selected level for the category <value> is the same as your current level. Please change it or remove it with the delete button.",
      "es": "<value> Por favor complételo o elimínelo con el botón Eliminar",
      "pt": "<value> Por favor altere ou remova ele com o botão excluir."
    }, {
      "key": "cancelbudget",
      "en": "Are you sure you want to cancel Budget Authority Request",
      "es": "¿Está seguro de que desea cancelar la Solicitud de Autoridad Presupuestaria",
      "pt": "Tem certeza de que deseja cancelar a Solicitação de autoridade orçamentária"
    }, {
      "key": "errorFindingbudgetSub",
      "en": "Error finding budget requests waiting for the user as a substitute. Try again later.",
      "es": "Error al buscar Solicitudes de Presupuesto como Sustituto. Intente nuevamente más tarde.",
      "pt": "Erro ao localizar solicitações de orçamento aguardando o usuário como substituto. Tente mais tarde."
    }, {
      "key": "errorCompanyOpt",
      "en": "Error: unable to process company options from API",
      "es": "Error: no se pueden procesar las opciones de la empresa desde la API",
      "pt": "Erro: não é possível processar as opções da empresa a partir da API"
    }, {
      "key": "errRejecting",
      "en": "There was an error rejecting the request. Please try again later.",
      "es": "Se produjo un error al rechazar la Solicitud. Por favor, inténtelo de nuevo más tarde o contacte con el equipo de IT local.",
      "pt": "Ocorreu um erro ao rejeitar a solicitação. Por favor, tente novamente mais tarde."
    }, {
      "key": "selReg",
      "en": 'Please select a region, or select "No" for access needed beyond your company.',
      "es": 'Por favor seleccione una Región, o seleccione "No" en la opción "¿Requiere acceso a otros países/regiones? "',
      "pt": 'Selecione uma região ou selecione "Não" para acessar além da sua empresa.'
    }, {
      "key": "sameAccess",
      "en": "Your selected region access is the same as your existing access",
      "es": "El acceso a la Región seleccionada es el mismo a su acceso actual",
      "pt": "O acesso de região selecionada é igual ao seu acesso existente"
    }, {
      "key": "chooseReqType",
      "en": "Please choose a request type.",
      "es": 'Por favor complete el campo "Autorización de Accesos".',
      "pt": "Por favor, escolha um tipo de solicitação."
    }, {
      "key": "errinReq",
      "en": "There is a problem with your request:",
      "es": "Hay un problema con su Solicitud:",
      "pt": "Há um problema com sua solicitação:"
    },{
      "key": "Language",
      "en": "Language",
      "es": "Idioma",
      "pt": "Idioma"
    }, {
      "key": "Numbering Format",
      "en": "Numbering Format",
      "es": "Formato de Número",
      "pt": "Representação decimal"
    }, {
      "key": "Date Format",
      "en": "Date Format",
      "es": "Formato de Fecha",
      "pt": "Formato de data"
    }, {
      "key": "Time Format",
      "en": "Time Format",
      "es": "Formato de Hora",
      "pt": "Formato hora"
    }, {
      "key": "Draft",
      "en": "Draft",
      "es": "Borrador",
      "pt": "Rascunho"
    }, {
      "key": "In Review",
      "en": "In Review",
      "es": "En Revisión",
      "pt": "Em revisão"
    }, {
      "key": "Approval In Progress",
      "en": "Approval In Progress",
      "es": "Aprobación en Progreso",
      "pt": "Em aprovação"
    }, {
      "key": "Pending Clarification",
      "en": "Pending Clarification",
      "es": "Pendiente de Aclaración",
      "pt": "Pendente de esclarecimento"
    }, {
      "key": "Rejected",
      "en": "Rejected",
      "es": "Rechazado",
      "pt": "Rejeitado"
    }, {
      "key": "Cancel",
      "en": "Cancel",
      "es": "Cancelado",
      "pt": "Cancelado"
    }, {
      "key": "Approved",
      "en": "Approved",
      "es": "Aprobado",
      "pt": "Aprovado"
    }, {
      "key": "PO under review",
      "en": "PO under review",
      "es": "OC en revisión",
      "pt": "PO sob revisão"
    }, {
      "key": "SAP PO Error",
      "en": "SAP PO In Error",
      "es": "Error en OC de SAP",
      "pt": "Erro SAP PO"
    }, {
      "key": "SAP PO In Error",
      "en": "SAP PO In Error",
      "es": "Error en OC de SAP",
      "pt": "Erro SAP PO"
    }, {
      "key": "Processed",
      "en": "Processed",
      "es": "Procesado",
      "pt": "Processado"
    }, {
      "key": "Additional Finance Review",
      "en": "Additional Finance Review",
      "es": "Revisión de Finanzas Adicional",
      "pt": "Revisão Finanças adicional"
    }, {
      "key": "Finance Review",
      "en": "Finance Review",
      "es": "Revisión de Finanzas",
      "pt": "Revisão Finanças"
    }, {
      "key": "Loading...",
      "en": "Loading...",
      "es": "Cargando...",
      "pt": "Carregando..."
    }, {
      "key": "Create Request Only",
      "en": "Create Request Only",
      "es": "Creación de SOC",
      "pt": "Somente criar solicitações"
    }, {
      "key": "Create Request",
      "en": "Create Request",
      "es": "Creación de SOC",
      "pt": "Somente criar solicitações"
    }, {
      "key": "Admin Access",
      "en": "(Admin Access (No approval authority; Create POR only)",
      "es": "(Acceso únicamente a creación de SOC)",
      "pt": "(Acesso Admin (Sem autoridade de aprovação; Criar somente POR)"
    }, {
      "key": "Create and Approve Request",
      "en": "Create and Approve Request",
      "es": "Creación y Aprobación de SOC",
      "pt": "Criar e aprovar solicitações"
    }, {
      "key": "Budget Authority Approver Request",
      "en": "(Budget Authority Approver Request)",
      "es": "(Acceso a creación y aprobación funcional de SOC)",
      "pt": "(Solicitação de aprovador de autoridade orçamentária)"
    }, {
      "key": "Display Only",
      "en": "Display Only",
      "es": "Acceso de sólo lectura",
      "pt": "Somente visualizar"
    }, {
      "key": "Display Access",
      "en": "Display Access",
      "es": "Acceso de sólo lectura",
      "pt": "Somente visualizar"
    }, {
      "key": "Create/Change",
      "en": "Create/Change",
      "es": "Crear / Cambiar",
      "pt": "Criar / Alterar"
    },{
      "key": "Your Requests",
      "en": "Your Requests",
      "es": "Sus Solicitudes",
      "pt": "Suas solicitações"
    }, {
      "key": "Requests Created for Others",
      "en": "Requests Created for Others",
      "es": "Solicitudes creadas para otros",
      "pt": "Solicitações criadas por outros"
    }, {
      "key": "Waiting for your Approval",
      "en": "Waiting for your Approval",
      "es": "Esperando su aprobación",
      "pt": "Aguardando sua aprovação"
    }, {
      "key": "Waiting for your Approval as a Substitute",
      "en": "Waiting for your Approval as a Substitute",
      "es": "Esperando su aprobación como sustituto",
      "pt": "Aguardando sua aprovação como substituto"
    }, {
      "key": "Approved or Rejected Requests",
      "en": "Approved or Rejected Requests",
      "es": "Solicitudes Aprobadas o Rechazadas",
      "pt": "Solicitações aprovadas ou rejeitadas"
    },  {
      "key": "Company Code",
      "en": "Company Code",
      "es": "Compañía",
      "pt": "Empresa"
    },
    {
      "key": "Purchase Category",
      "en": "Purchase Category",
      "es": "Categoría de Compra",
      "pt": "Categoria de Compra"
    },
    {
      "key": "POR Brief Description",
      "en": "POR Brief Description",
      "es": "Descripción breve",
      "pt": "Breve descrição"
    },
    {
      "key": "Creator",
      "en": "Creator",
      "es": "Creado Por",
      "pt": "Criado Por"
    }, {
      "key": "Requester",
      "en": "Requester",
      "es": "Solicitante",
      "pt": "Solicitante"
    }, {
      "key": "Created On",
      "en": "Created On",
      "es": "Creado",
      "pt": "Criado Em"
    }, {
      "key": "Vendor Name",
      "en": "Vendor Name",
      "es": "Nombre Proveedor",
      "pt": "Nome do Fornecedor"
    }, {
      "key": "Currency",
      "en": "Currency",
      "es": "Moneda",
      "pt": "Moeda"
    }, {
      "key": "Total Cost",
      "en": "Total Cost",
      "es": "Costo Total",
      "pt": "Custo Total"
    }, {
      "key": "Total Cost USD",
      "en": "Total Cost USD",
      "es": "Costo Total USD",
      "pt": "Custo Total USD"
    }, {
      "key": "Pending With",
      "en": "Pending With",
      "es": "Pendiente Con",
      "pt": "Pendente Com"
    },  {
      "key": "Pending Since",
      "en": "Pending Since",
      "es": "Pendiente Desde",
      "pt": "Pendente Desde"
    },
    {
      "key": "previous",
      "en": "Previous",
      "es": "Anterior",
      "pt": "Anterior"

    },
    {
      "key": "next",
      "en": "Next",
      "es": "Siguiente",
      "pt": "Próximo"

    },
    { // done
      "key": "apiErr",
      "en": "API error retrieving history",
      "es": "Error de API al recuperar el historial",
      "pt": "Erro API em buscar histórico"
    },
    {
      "key": "apprNot",
      "en": "Approver Field: <value>  is not selected. Please choose an approver",
      "es": "Campo Aprobador: <value> no está seleccionado. Por favor elija un Aprobador",
      "pt": "Campo aprovador: <value> não está selecionado. Favor selecione um aprovador"
    },
    {
      "key": "addlApprBl",
      "en": "Approver Field: Additional Approver  <value> was left blank. Please choose an approver or remove the field by clicking the x.",
      "es": "Campo Aprobador: el Aprobador adicional <value> está vacío. Elija un Aprobador o elimine el campo haciendo clic en la \"x\".",
      "pt": "Campo aprovador: Aprovador adicional <value>  foi deixado em branco. Por favor selecione um aprovador ou remova o campo clicando no 'X'."
    },
    {
      "key": "addlApprSame",
      "en": "Approver Field: Additional Approver <value>  is the same as the requester. Please change the approver",
      "es": "Campo Aprobador: el Aprobador adicional <value> es el mismo que el Solicitante. Por favor cambie el Aprobador",
      "pt": "Campo aprovador: Aprovador adicional <value>  é o próprio requisitante. Por favor altere o aprovador."
    },
    {
      "key": "sureRemovePR",
      "en": "Are you sure you want to cancel Purchase Order Request #",
      "es": "¿Está seguro de eliminar la Solicitud de compra #",
      "pt": "Tem certeza de que quer eliminar a solicitação de compra #"
    },
    {
      "key": "sureDelete",
      "en": "Are you sure you would like to delete",
      "es": "¿Estás seguro de que desea eliminar",
      "pt": "Tem certeza de que gostaria de eliminar"
    },
    { // done
      "key": "enterDesc",
      "en": "Brief description of the purchase Field: Brief description of the purchase was left blank. Please Enter Brief description of the purchase.",
      "es": "El campo \"Descripción breve/Comentarios Internos\" es obligatorio. Por favor, introduzca una breve descripción de la compra.",
      "pt": "Descrição breve do campo compra: Descrição breve da compra foi deixado em branca. Favor inserir descrição breve da compra."
    },
    { // done
      "key": "cantDelAppr",
      "en": "Cannot delete this approver. Atleast one approver should be level 5 or above.",
      "es": "No se puede eliminar este Aprobador. Al menos un aprobador debe ser de nivel 5 o superior.",
      "pt": "Não é possível excluir este aprovador. Pelo menos um aprovador deve ter nível 5 ou superior."
    },
    { // done
      "key": "cantFindReq",
      "en": "Cannot find request with id:",
      "es": "No se puede encontrar la SOC con id:",
      "pt": "Não foi possível encontrar a solicitação com o ID:"
    },
    { // done
      "key": "closedIO",
      "en": "Closed Internal Order",
      "es": "Orden Interna cerrada",
      "pt": "Ordem interna fechada"
    },
    { // done
      "key": "lockedCC",
      "en": "CostCenter - selected value is locked",
      "es": "Centro de Coste: el valor seleccionado está bloqueado",
      "pt": "Centro de custo - o valor selecionado está bloqueado"
    },
    { // done
      "key": "cantDatamine",
      "en": "Could not datamine approvers.",
      "es": "No fue posible determinar los aprobadores",
      "pt": "Não foi possível determinar os aprovadores."
    },
    { // done
      "key": "ddPast",
      "en": "Delivery date must not be in the past",
      "es": "La fecha de entrega no debe ser en el pasado",
      "pt": "A data de entrega não deve estar no passado"
    },
    { // done
      "key": "distrRow",
      "en": "Distribution Row",
      "es": "Línea de distribución",
      "pt": "Linha de distribuição"
    },
    { // done
      "key": "emailHere",
      "en": "Email here",
      "es": "Email aquí",
      "pt": "Email aqui"
    },
    { // done
      "key": "appRejReq",
      "en": "Error finding budget requests approved/rejected by the user. Try again later.",
      "es": "Error al buscar solicitudes de presupuesto aprobadas / rechazadas por el usuario. Intenta nuevamente más tarde.",
      "pt": "Erro ao encontrar solicitações de orçamento aprovadas / rejeitadas pelo usuário. Tente mais tarde."
    },
    { // done
      "key": "usrReq",
      "en": "Error finding budget requests requested for the user. Please try again later.",
      "es": "Error al buscar solicitudes de presupuesto solicitadas para el usuario. Por favor, inténtelo de nuevo más tarde.",
      "pt": "Erro ao encontrar solicitações de orçamento solicitadas ao usuário. Por favor, tente novamente mais tarde."
    },
    { // done
      "key": "msgUpdt",
      "en": "Error retrieving updated message value. Please refresh.",
      "es": "Error al recuperar el valor actualizado del mensaje. Por favor refrescar.",
      "pt": "Erro ao recuperar o valor atualizado da mensagem. Por favor atualize."
    },
    { // done
      "key": "vpOpts",
      "en": "Error retrieving VP options, which are needed for this request. Please try again later.",
      "es": "Error al recuperar las opciones de VP, que son necesarias para esta solicitud. Por favor, inténtelo de nuevo más tarde.",
      "pt": "Erro ao recuperar as opções de VP, necessárias para esta solicitação. Por favor, tente novamente mais tarde."
    },
    { // done
      "key": "noMgr",
      "en": "Error - There is no manager for the selected user in the database.",
      "es": "Error: no hay un gerente en la base de datos para el usuario seleccionado.",
      "pt": "Erro - Não há gerente para o usuário selecionado no banco de dados."
    },
    { // done
      "key": "addressAPI",
      "en": "Error contacting Address Verification API.",
      "es": "Error al contactar con la API de verificación de dirección.",
      "pt": "Erro ao entrar em contato com a API de verificação de endereço."
    },
    { // done
      "key": "hrAPI",
      "en": "Error contacting API for HR users",
      "es": "Error al contactar la API para usuarios de recursos humanos",
      "pt": "Erro ao entrar em contato com a API para usuários de RH"
    },
    {
      "key": "errAPI",
      "en": "Error contacting API.",
      "es": "Error al contactar la API.",
      "pt": "Erro ao entrar em contato com a API."
    },
    { // done
      "key": "adAPI",
      "en": "Error contacting API: Unable to determine AD status.",
      "es": "Error al contactar la API: no se puede determinar el estado de AD.",
      "pt": "Erro ao entrar em contato com a API: não foi possível determinar o status do AD."
    },
    { // done
      "key": "usrBudget",
      "en": "Error finding budget requests created by the user. Try again later.",
      "es": "Error al buscar solicitudes de presupuesto creadas por el usuario. Intente nuevamente más tarde.",
      "pt": "Erro ao encontrar solicitações de orçamento criadas pelo usuário. Tente mais tarde."
    },
    { // done
      "key": "usrBrWait",
      "en": "Error finding budget requests waiting for the user. Try again later.",
      "es": "Error al buscar solicitudes de presupuesto esperando al usuario. Intente nuevamente más tarde.",
      "pt": "Erro ao encontrar solicitações de orçamento aguardando pelo usuário. Tente mais tarde."
    },
    { // done
      "key": "reqComment",
      "en": "Error finding comments for this request",
      "es": "Error al buscar comentarios para esta solicitud",
      "pt": "Erro ao encontrar comentários para esta solicitação"
    },
    { // done
      "key": "levelVal",
      "en": "Error finding current value for one or more user levels",
      "es": "Error al buscar el valor actual en uno o más niveles de usuario",
      "pt": "Erro ao localizar o valor atual em um ou mais níveis de usuário"
    },
    { // done
      "key": "msgProcess",
      "en": "Error reprocessing message. Try again later",
      "es": "Error al reprocesar el mensaje. Intente nuevamente más tarde",
      "pt": "Erro ao reprocessar a mensagem. Tente mais tarde"
    },
    { // done
      "key": "matOpts",
      "en": "Error retrieving Material options",
      "es": "Error al buscar opciones de material",
      "pt": "Erro ao recuperar opções de material"
    },
    { // unused..
      "key": "uomOpts",
      "en": "Error retrieving UOM options from Api",
      "es": "Error API al buscar opciones de UM",
      "pt": "Erro ao recuperar as opções de UOM da API"
    },
    { // done
      "key": "fileLoad",
      "en": "Error uploading file(s). Please Try again.",
      "es": "Se produjo un error al cargar los archivos. Inténtelo nuevamente.",
      "pt": "Erro ao carregar arquivo (s). Por favor, tente novamente."
    },
    { // done
      "key": "errAPI2",
      "en": "Error while contacting API.",
      "es": "Error al contactar la API.",
      "pt": "Erro ao entrar em contato com a API."
    },
    { // done
      "key": "faxHere",
      "en": "Fax here",
      "es": "Fax aquí",
      "pt": "Fax aqui"
    }, {
      "key": "assetLock",
      "en": "Line Item <value> - Locked Asset Type",
      "es": "Línea <value>: Tipo de activo bloqueado",
      "pt": "Item de linha <value> - Tipo de ativo bloqueado"
    }, {
      "key": "assetclassLock",
      "en": "Asset Class is locked.",
      "es": "La Clase de Activo está bloqueada.",
      "pt": "Classe de ativo está bloqueada."
    }, {
      "key": "assetNoLock",
      "en": "Asset Number is locked.",
      "es": "El número de Activo Fijo está bloqueado.",
      "pt": "O número do ativo está bloqueado."
    }, {
      "key": "costcenterLock",
      "en": "Cost Center is locked.",
      "es": "Centro de Coste bloqueado",
      "pt": "Centro de custo bloqueado"
    },
    {
      "key": "ccLock",
      "en": "Line Item <value> - Locked Cost Center",
      "es": "Línea <value>: Centro de Coste bloqueado",
      "pt": "Item de linha <value> - Centro de custo bloqueado"
    },
    { // done
      "key": "glLock",
      "en": "Locked GL Account",
      "es": "Línea: Cuenta GL bloqueada",
      "pt": "Conta contábil bloqueada"
    },
    { // done
      "key": "pcLock",
      "en": "Locked Profit Center",
      "es": "Línea: Centro de Beneficio bloqueado",
      "pt": "Centro de lucro bloqueado"
    },
    { // done
      "key": "noAuth",
      "en": "No authorization required",
      "es": "No se requiere autorización",
      "pt": "Não é necessária autorização"
    },
    { // done
      "key": "noDraft",
      "en": "No Draft to cancel.",
      "es": "No hay ningún borrador para cancelar.",
      "pt": "Nenhum rascunho para cancelar."
    },
    { // done
      "key": "detailsCC",
      "en": "Order Request Details: Cost Center",
      "es": "Detalles de solicitud de pedido: Centro de Costes",
      "pt": "Detalhes da solicitação de pedido: Centro de custo"
    },
    { // done
      "key": "fullPercent",
      "en": "percentage distribution does not equal 100%",
      "es": "distribución porcentual no es igual al 100%",
      "pt": "distribuição percentual não é igual a 100%"
    },
    { // done
      "key": "startBefore",
      "en": "Please ensure that the start date occurs before the end date.",
      "es": "Asegúrese de que la fecha de inicio sea anterior a la fecha de finalización.",
      "pt": "Verifique se a data de início ocorre antes da data de término."
    },
    { // done
      "key": "validDetails",
      "en": "Please enter valid details",
      "es": "Por favor introduzca detalles válidos",
      "pt": "Insira detalhes válidos"
    },
    { // unused..
      "key": "changeReason",
      "en": "Please fill reasons for change requested.",
      "es": "Por favor complete los motivos del cambio solicitado.",
      "pt": "Por favor, preencha os motivos da alteração solicitada."
    },
    { // done
      "key": "addlApprAdd",
      "en": "Please select an additional approver for this scenario",
      "es": "Seleccione un aprobador adicional para este escenario",
      "pt": "Selecione um aprovador adicional para este cenário"
    },
    { // done
      "key": "largePU",
      "en": "Price Unit (Too large)",
      "es": "Precio Unitario (demasiado grande)",
      "pt": "Unidade de preço (muito grande)"
    },
    { // done
      "key": "largeQty",
      "en": "Qty (Too large)",
      "es": "Cantidad (demasiado grande)",
      "pt": "Qtd. (muito grande)"
    },
    { // done
      "key": "reqApprSame",
      "en": "Requester and approver are the same. Please choose a different approver.",
      "es": "El Solicitante y el Aprobador son la misma persona. Por favor, elija un Aprobador diferente.",
      "pt": "O solicitante e o aprovador são os mesmos. Por favor, escolha um aprovador diferente."
    },
    { // done
      "key": "reqType",
      "en": "Requisition Type",
      "es": "Tipo de solicitud",
      "pt": "Tipo de solicitação"
    },
    { // done
      "key": "lv5Err",
      "en": "Select atleast one approver with level 5 or above.",
      "es": "Seleccione al menos un aprobador con nivel 5 o superior.",
      "pt": "Selecione pelo menos um aprovador com nível 5 ou superior."
    },
    { // done
      "key": "selApprAlready",
      "en": "Selected approver is already added",
      "es": "El aprobador seleccionado ya existe",
      "pt": "O aprovador selecionado já foi adicionado"
    },
    { // unused..
      "key": "spcAuthReq",
      "en": "Special Auth Request #",
      "es": "Solicitud de autoridad especial #",
      "pt": "Solicitação especial de autoridade #"
    },
    { // done
      "key": "subNotEq",
      "en": "sub-quantities do not equal the total",
      "es": "subcantidades no son iguales al total",
      "pt": "sub-quantidades não são iguais ao total"
    },
    { // done
      "key": "subInPast",
      "en": "Substitute date must not be in the past",
      "es": "La fecha de sustitución no debe ser en el pasado",
      "pt": "A data de substituição não deve estar no passado"
    },
    { // done
      "key": "success",
      "en": "Success",
      "es": "Éxito",
      "pt": "Sucesso"
    },
    { // done
      "key": "noResult",
      "en": "The search returned no results.",
      "es": "La búsqueda no devolvió resultados.",
      "pt": "A pesquisa não retornou resultados."
    },
    { // done
      "key": "currencyFail",
      "en": "The API has failed for the given order currency. Please select another currency.",
      "es": "La API ha fallado para la moneda seleccionda. Por favor seleccione otra moneda.",
      "pt": "A API falhou para a moeda do pedido especificada. Por favor, selecione outra moeda."
    },
    { // done
      "key": "ccHeaderErr",
      "en": "The header Cost Center must match at least one line item Cost Center",
      "es": "El Centro de Costes del encabezado debe coincidir con el Centro de Costes de al menos una línea",
      "pt": "O cabeçalho Centro de custo deve corresponder a pelo menos um item de linha Centro de custo"
    },
    { // unused..
      "key": "noResult2",
      "en": "The search returned no results",
      "es": "La búsqueda no devolvió resultados",
      "pt": "A pesquisa não retornou resultados"
    },
    { // done
      "key": "noFiles",
      "en": "There are no attachments associated with this request.",
      "es": "No hay archivos adjuntos asociados con esta solicitud.",
      "pt": "Não há anexos associados a esta solicitação."
    },
    { // done
      "key": "fileProblem",
      "en": "there was a problem uploading your file(s). Please try again.",
      "es": "se produjo un problema al cargar sus archivos. Intente nuevamente.",
      "pt": "Houve um problema ao fazer upload dos seus arquivos. Por favor, tente novamente."
    },
    { // done
      "key": "apprErr",
      "en": "There was an error approving the request. Please try again later",
      "es": "Se produjo un error al aprobar la solicitud. Por favor, intente nuevamente más tarde",
      "pt": "Ocorreu um erro ao aprovar a solicitação. Por favor, tente novamente mais tarde"
    },
    { // done
      "key": "fileDelErr",
      "en": "There was an error deleting the file",
      "es": "Se produjo un error al eliminar el archivo.",
      "pt": "Ocorreu um erro ao excluir o arquivo"
    },
    { // done, but check API for potential language mismatch
      "key": "reqProcessErr",
      "en": "There was an error processing your request",
      "es": "Se produjo un error al procesar su solicitud",
      "pt": "Houve um erro ao processar seu pedido"
    },
    { // done
      "key": "reqRetrieveErr",
      "en": "There was an error retrieving the new request info. Resetting...",
      "es": "Se produjo un error al recuperar la nueva información de solicitud. Restableciendo...",
      "pt": "Ocorreu um erro ao recuperar as novas informações da solicitação. Restabelecendo ..."
    },
    { // done
      "key": "reqUpdateErr",
      "en": "There was an error updating the request",
      "es": "Se produjo un error al actualizar la solicitud",
      "pt": "Ocorreu um erro ao atualizar a solicitação"
    },
    { // done
      "key": "errsInReq",
      "en": "There were errors in your request - please fix the following values:",
      "es": "Se produjeron errores en su solicitud. Corrija los siguientes valores:",
      "pt": "Ocorreram erros na sua solicitação - corrija os seguintes valores:"
    },
    { // done
      "key": "largeTotalCost",
      "en": "Total Cost must be no greater than 13 digits long",
      "es": "El costo total no debe tener más de 13 dígitos.",
      "pt": "O custo total não deve exceder 13 dígitos"
    },
    {
      "key": "cantDelFile",
      "en": "Unable to delete file  <value>-  due to an API error. Please try again later",
      "es": "No se puede eliminar el archivo <value> debido a un error de API. Por favor, intente nuevamente más tarde",
      "pt": "Não foi possível excluir o arquivo <value> - devido a um erro de API. Por favor, tente novamente mais tarde"
    },
    { // done
      "key": "cantGetAdlApr",
      "en": "Unable to determine additional approvers.",
      "es": "No se pueden determinar aprobadores adicionales.",
      "pt": "Não foi possível determinar aprovadores adicionais."
    },
    { // done
      "key": "cantActvSub",
      "en": "Unable to activate substitutor:",
      "es": "No se puede activar el sustituto:",
      "pt": "Não foi possível ativar o substituto:"
    },
    { // unused..
      "key": "cantCurrLv",
      "en": "Unable to determine current approval level for the selected user.",
      "es": "No se puede determinar el nivel de aprobación actual para el usuario seleccionado.",
      "pt": "Não foi possível determinar o nível de aprovação atual do usuário selecionado."
    },
    { // done
      "key": "cantRegion",
      "en": "Unable to determine region for the selected user.",
      "es": "No se puede determinar la región para el usuario seleccionado.",
      "pt": "Não foi possível determinar a região para o usuário selecionado."
    },
    { // done
      "key": "cantFindAD",
      "en": "Unable to find selected user in AD table.",
      "es": "No se puede encontrar el usuario seleccionado en la tabla AD.",
      "pt": "Não foi possível encontrar o usuário selecionado na tabela do AD."
    },
    { // done
      "key": "cantFindADProxy",
      "en": "Unable to locate proxied user in AD users table.",
      "es": "No se puede ubicar el usuario proxy en la tabla AD.",
      "pt": "Não foi possível localizar o usuário proxy na tabela de usuários do AD."
    },
    { // unused
      "key": "cantCurrAuth",
      "en": "Unable to retireve current authority level from API.",
      "es": "No se puede recuperar el nivel de autoridad actual desde la API.",
      "pt": "Não foi possível recuperar o nível de autoridade atual da API."
    },
    { // done
      "key": "cantFindBuyer",
      "en": "Unable to retrieve buyer options.",
      "es": "No se pueden recuperar las opciones del comprador.",
      "pt": "Não foi possível recuperar as opções do comprador."
    },
    { // done
      "key": "cantValidateErr",
      "en": "Unable to validate. Error:",
      "es": "No se puede validar. Error:",
      "pt": "Não foi possível validar. Erro:"
    },
    { // done
      "key": "largeUnitCost",
      "en": "Unit Cost (Too large)",
      "es": "Costo Unitario (demasiado grande)",
      "pt": "Custo unitário (muito grande)"
    },
    { // done
      "key": "vendorLock",
      "en": "Vendor - selected value is locked",
      "es": "Proveedor: el valor seleccionado está bloqueado",
      "pt": "Fornecedor - o valor selecionado está bloqueado"
    },

    { // done
      "key": "hiLvAppr",
      "en": "Warning: You have selected the highest level of approval",
      "es": "Advertencia: ha seleccionado el nivel más alto de aprobación",
      "pt": "Aviso: Você selecionou o nível mais alto de aprovação"
    },
    { // unused..
      "key": "dataLock",
      "en": "You have selected locked data",
      "es": "Has seleccionado datos bloqueados",
      "pt": "Você selecionou dados bloqueados"
    },
    { // done
      "key": "IOClose",
      "en": "You have selected a closed IO.",
      "es": "Ha seleccionado una OI cerrada.",
      "pt": "Você selecionou um IO fechado."
    },
    { // unused..
      "key": "dataBlock",
      "en": "You have selected blocked data.",
      "es": "Ha seleccionado datos bloqueados.",
      "pt": "Você selecionou dados bloqueados."
    },
    { // unused..
      "key": "plsChooseNo",
      "en": "You have selected both header and special functionality as 0. Please choose \"no\" for special functional authority.",
      "es": "Ha seleccionado tanto el encabezado como la funcionalidad especial como 0. Seleccione \"no\" para obtener una autoridad funcional especial.",
      "pt": "Você selecionou o cabeçalho e a funcionalidade especial como 0. Por favor, escolha \"não\" para autoridade funcional especial."
    },
    {
      "key": "Status",
      "en": "Status",
      "es": "Estado",
      "pt": "Status"
    }
  ];

  language = 'en';

  constructor(private userPrefService: UserPrefService) {
    // this.userPrefService.getProfileFromCache().then(x => {
    //   if (x) {
    //     // console.log(x);
    //     // console.log(x.userPref[0].value.language);
    //     this.language = x.userPref[0].value.language;
    //   }
    // }).catch(err => console.log(err));
   }

   returnMsgWithParam(key: string, params: any[], returnKey?: boolean): string {
     let msg = '';
     msg = this.returnMsg(key, returnKey);
     params.forEach(param => {
       msg = msg.replace('<value>', param);
     });
     return msg;
   }

  returnMsg(key: string, returnKey?: boolean): string {
    let lang = 'EN';
    if (window.location.href.indexOf('/pt') !== -1) {
      lang = 'PT';
    } else if (window.location.href.indexOf('/es') !== -1) {
      lang = 'ES';
    }
    const msg = this.data.find(str => str.key === key);
    if (msg) {
      switch (lang) {
        case 'PT':
          return msg.pt;
        case 'ES':
          return msg.es;
        case 'EN':
          return msg.en;
        default:
          return msg.en;
      }
    } else {
      if (returnKey) {
        return key;
      } else {
        return 'ERROR';
      }
    }
  }
}

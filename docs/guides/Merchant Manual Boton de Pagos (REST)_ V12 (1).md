![][image1]

**Credibanco Manual REST para**  
**integración al Botón de**

**Pagos**	

**Author:**	Juan Luis Navarro

**Version:** 12

**Date:**	2021.04.29

**TABLA DE CONTENIDO**

1. **[HISTORIA DE REVISIONES	3](#historia-de-revisiones)**  
2. [**SOBRE EL DOCUMENTO	4**](#sobre-el-documento)  
3. [**TERMINOLOGÍA	5**](#terminología)  
4. [**INTRODUCCIÓN	6**](#introducción)

5. [**CONEXIÓN	7**](#conexión)  
6. [**INTERACCIÓN DE LOS SISTEMAS INFORMATIVOS	8**](#interacción-de-los-sistemas-informativos)

   1. [**Esquema de interacción al pagar con “botón de pagos”**	**8**](#esquema-de-interacción-al-pagar)

   2. [**Realización de esquemas de interacción por parte del comercio	9**](#realización-de-esquemas-de-interacción-por-parte-del-comercio)

   3. [**Esquema de interacción al pagar con “API”**	**10**](#esquema-de-interacción-al-pagar-1)

   4. [**Realización de esquemas de interacción por parte de la gateway	11**](#realización-de-esquemas-de-interacción-por-parte-de-la-gateway)

7. [**ALGORITMO DE ACCIONES PARA CONECTARSE A LA PASARELA**](#algoritmo-de-acciones-para-conectarse-a-la-pasarela-de-pago) **[DE PAGO	12](#algoritmo-de-acciones-para-conectarse-a-la-pasarela-de-pago)**  
8. [**INTERFAZ REST	13**](#interfaz-rest)

   1. [**Especificaciones para probar las solicitudes REST en el navegador de Internet	13**](#especificaciones-para-probar-las-solicitudes-rest-en-el-navegador-de-internet)

   2. [**Solicitudes utilizadas para el pago en una etapa	14**](#solicitudes-utilizadas-para-el-pago-en-una-etapa)  
      1. [Solicitud de registro del pedido	14](#solicitud-de-registro-del-pedido)  
      2. [Solicitud de registro del pedido para comercios de viajes (MCC 4722\) con dispersión	23](#solicitud-de-registro-del-pedido-para-comercios-de-viajes-\(mcc-4722\)-con-dispersión)

      3. [Solicitud de anulación del pago del pedido	33](#solicitud-de-anulación-del-pago-del-pedido)  
      4. [Solicitud ampliada del estado del pedido	35](#solicitud-ampliada-del-estado-del-pedido)

      5. [Solicitud de pago al recopilar datos de la tarjeta del lado del comercio (o gateway)	44](#solicitud-de-pago-al-recopilar-datos-de-la-tarjeta-del-lado-del-comercio-\(o-gateway\))  
      6. [Solicitud de pago al recopilar datos de la tarjeta del lado del comercio (o gateway) para](#solicitud-de-pago-al-recopilar-datos-de-la-tarjeta-del-lado-del-comercio-\(o-gateway\)-para-comercios-de-viajes-\(mcc-4722\)) [comercios de viajes (MCC 4722\)	48](#solicitud-de-pago-al-recopilar-datos-de-la-tarjeta-del-lado-del-comercio-\(o-gateway\)-para-comercios-de-viajes-\(mcc-4722\))  
      7. [Solicitud consulta de estado órdenes PSE	52](#solicitud-consulta-de-estado-órdenes-pse)

9. [**NOTIFICACIONES Callback	55**](#notificaciones-callback)

   1. [**Información General	55**](#información-general)

   2. [**Formato de URL para notificaciones de devolución de llamada (callback)	55**](#formato-de-url-para-notificaciones-de-devolución-de-llamada-\(callback\))

   3. [**Algoritmo para procesar notificaciones de devolución de llamada (callback)	56**](#algoritmo-para-procesar-notificaciones-de-devolución-de-llamada-\(callback\))

      1. [Notificación sin suma de verificación	56](#notificación-sin-suma-de-verificación)

10. [**LISTADO DE CONEXIONES EN AMBIENTES DE PRUEBA Y**](#listado-de-conexiones-en-ambientes-de-prueba-y-producción) **[PRODUCCIÓN	58](#listado-de-conexiones-en-ambientes-de-prueba-y-producción)**

    1. [**Conexiones REST	58**](#conexiones-rest)  
       1. [Conexiones para la realización de pruebas	58](#conexiones-para-la-realización-de-pruebas)

       2. [Conexiones ambiente de producción	59](#conexiones-ambiente-de-producción)

11. [**TARJETAS DE PRUEBAS	60**](#tarjetas-de-pruebas)

12. [**ANEXO 1\. CÓDIGOS DE RESPUESTA: DESCIFRADO DE**](#anexo-1.-códigos-de-respuesta:-descifrado-de-actionco\(respuesta-del-procesamiento\)) **[ACTIONCO(RESPUESTA DEL PROCESAMIENTO)	61](#anexo-1.-códigos-de-respuesta:-descifrado-de-actionco\(respuesta-del-procesamiento\))**  
13. [**ANEXO 2\. CÓDIGOS DE INSTITUCIONES FINANCIERAS	74**](#anexo-2.-códigos-de-instituciones-financieras)

1. # **HISTORIA DE REVISIONES** {#historia-de-revisiones}

| Fecha | Versión | Descripción | Autor |
| ----- | ----- | ----- | ----- |
|  12/02/2021 |  9 | Actualización información del campo orderNumber en el numeral 8.2.1, para recibir número de pedido para pagos PSE.  Actualización sección 8.2.2 no pagos con PSE y análisis de Cybersource para ordenes con dispersión para comercios MCC 4722\.  Actualización títulos Anexo 1 y 2\. |  JLNN |
|  19/03/2021 |  10 | Se crea la sección 8.2.2.1 en donde se explica el método REST para transacciones de dispersión de fondos en comercios de agencia de viajes MCC 4722 que van a utilizar  el  servicio  de  Cybersource.  Se hace la claridad de usar el servicio GetOrderStatusExtended hasta obtener un estado final |  JLNN |
|  16/04/2021 |  11 | Se actualiza el numeral 8.2.3 para realizar anulaciones a través de los servicios de API. Se actualiza los endpoints de los servicios numeral 10.1 |  JLNN |
|  29/04/2021 |  12 | Se actualizan los numerales 8.1.3 y 9.2.3 en donde se hace la aclaración que no se permiten anulaciones parciales en los servicios del API. |  JLNN |

JLNN – Juan Luis Navarro Navarro – BA BPC

2. # **SOBRE EL DOCUMENTO** {#sobre-el-documento}

El presente documento describe los principios de conexión y las interfaces del programa de la pasarela de pago.

3. # **TERMINOLOGÍA** {#terminología}

* *Tarjeta bancaria* – Tarjeta de los sistemas internacionales de pago VISA y MasterCard.  
* *Banco adquiriente* – Banco que realiza y utiliza la pasarela de pago.  
* *Banco emisor* – Banco que ha expedido la tarjeta bancaria del cliente.

* *CSS* \- Hojas de estilo en cascada (o CSS, siglas en inglés de Cascading Stylesheets) es un lenguaje de diseño gráfico para definir y crear la presentación de un documento estructurado escrito en un lenguaje de marcado.

* *Pago en dos etapas* – Operación de pago de productos/servicios a través de Internet con ayuda de tarjetas bancarias que requiere una confirmación adicional por parte del comercio. El mecanismo de dos etapas permite dividir el proceso de comprobación de la capacidad de pago de la tarjeta (autorización) y el cargo del pago (comprobante financiero). En la primera etapa del pago en dos etapas se realiza la comprobación de la capacidad de pago de la tarjeta bancaria y el bloqueo de la suma en la cuenta del cliente. En la segunda se confirma la realización del pago.

* *Pedido* – La esencia elemental del sistema, describe el pedido en una comercio online o en su análogo. Cada pedido tiene una suma.

* *Comercio (merchant)* – Empresa de venta y prestación de servicios que vende productos o presta servicios a través de una web.

* *SIP* – Sistema internacional de pago (por ejemplo, Visa o MasterCard)

* *Pago en una etapa* \- Operación de pago de productos/servicios a través de Internet con ayuda de tarjetas bancarias que no requiere una confirmación adicional.

* *Anulación del pago* – Eliminación del bloqueo de la suma en la tarjeta del comprador. Esta función está disponible el mismo día que la transacción original.

* *Forma de pago* (*formulario de pago; página de pago; botón de pago*) – Página HTML, que se utiliza por el cliente para introducir los requisitos del pago.

* *Requisitos del pago* – Requisitos que se utilizan por el usuario para pagar el pedido. Normalmente es el número de la tarjeta, fecha de expiración, CVC.  
* *Pasarela de pago del banco adquiriente* – Sistema automático que da la posibilidad al *comercio*

recibir y al cliente mandar los pagos a través de Internet con ayuda de las tarjetas bancarias.

* *Pagador* – Persona física que realiza el pago con su tarjeta de los servicios del vendedor en el comercio online del vendedor.

* *Enlace* – Concordancia entre el pagador y los requisitos de pago de la tarjeta (número de tarjeta, fecha de caducidad).

4. # **INTRODUCCIÓN** {#introducción}

La compra a través de Internet es el método moderno de la venta de servicios o productos a través de Internet con ayuda de tarjetas bancarias.

Conforme las especificaciones de las compras por Internet existe una necesidad de asegurar una interacción segura entre las partes que participan en la operación de venta de servicios/productos: el cliente, el comercio y el banco adquiriente.

El comercio que planea vender sus servicios o productos a través de Internet con ayuda de las tarjetas bancarias tiene que realizar procesos para garantizar la seguridad de los pagos:

* La interacción con el cliente en el momento de traspasar los datos principales (datos personales, datos sobre los requisitos de las tarjetas de pago) se tiene que realizar con ayuda de recursos criptográficos (TLS).

* La información sobre el pago que se realiza (el importe, la divisa, la descripción del pedido) asi como el resultado de realización del pago tiene que ser seguros y tener defensa contra los delincuentes.

* En el momento de la realización del pago se tienen que aplicar los procesos de comprobación de la pertenencia de la tarjeta al cliente.

La ventaja de la pasarela de pago es que, con su ayuda, el comercio cumple con todos los procedimientos de seguridad necesarios sin realizar cambios excesivos en sus páginas comerciales en línea y en los procesos comerciales existentes.

5. # **CONEXIÓN** {#conexión}

Para conectarse al sistema,el comercio debe presentar:

1. Establezca las relaciones contractuales necesarias con el banco adquirente y coloque en línea la tienda, la cual debe cumplir con los requisitos y las normas de la ley aplicable.  
2. Con el consentimiento del banco adquirente y la disponibilidad de un certificado PCI DSS una página HTML con gráficos y CSS y otros objetos conectables, proporcionando un formulario para obtener datos de la tarjeta. Los requisitos para esta página están descritos en la sección 10 “Formalización de la interfaz de pago”.

3. Como resultado de la conexión el comercio recibe:

   - Nombre de usuario: el nombre del comercio en el marco de la pasarela de pago. Se utiliza para realizar operaciones con ayuda de API.  
   - Contraseña: la contraseña del comercio en el marco de la pasarela de pago. Se utiliza solo para realizar operaciones a través de API.

6. # **INTERACCIÓN DE LOS SISTEMAS INFORMATIVOS** {#interacción-de-los-sistemas-informativos}

   1. **Esquema de interacción al pagar**

      **con “botón de pagos”**

   

Descripción:

1. El cliente interactúa con el comercio para crear el pedido en el comercio.  
2. Después de que el cliente confirme el pedido, el sistema del comercio registra el pedido en la pasarela de pago. Para el registro se utilizan los parámetros del importe del pago, la divisa, el número de pedido en el sistema del comercio y la URL de la devolución del cliente.

3. Al recibir la solicitud de registro, la pasarela de pago devuelve el identificador único del pedido en el sistema de pago y URL a la cual hay que redirigir al usuario para recibir el formulario de pago.  
4. El sistema del comercio transmite al navegador del cliente, el redireccionamiento a la URL, recibida en el paso 3\.  
5. El navegador del cliente abre la URL.  
6. En la página de la URL indicada, el navegador del cliente obtiene el formulario de pago.

7. El usuario completa el formulario recibido y manda los datos al servidor de la pasarela de pago.  
8. Al recibir los requisitos de pago (número de tarjeta, etc.) el sistema realiza el cobro de la cuenta del cliente.  
9. Después de realizar el pago, la pasarela de pago muestra una página de resultados de pago desde la cual el cliente puede regresar al sitio web del comercio (indicado anteriormente durante el registro).  
10. El navegador del cliente redirige al cliente al comercio.  
11. El sistema del comercio pide a la pasarela de pago el estado de pago del pedido (a través del número interno en el sistema de pago).  
12. La pasarela de pago devuelve el estado del pedido

13. El sistema del comercio pasa al navegador del cliente la página con los resultados del pago

Si después de pasar 20 minutos no se ha realizado el pago, el cliente no ha regresado de la pasarela de pago a la página de resultados de pago del comercio (a la URL de vuelta del cliente), el pago se considera fallido.

El cambio del estado de pago del pedido se puede realizar por solicitud del comercio de forma manual, por los trabajadores del banco después de comprobar el estado de la transacción en los sistemas del banco.

2. ## **Realización de esquemas de interacción por parte del comercio** {#realización-de-esquemas-de-interacción-por-parte-del-comercio}

En el marco de los dos sistemas entre el sistema del comercio y la pasarela de pago existen interacciones automáticas:

* 2, 3 (registerOrder – solicitud / respuesta)  
* 11 y 12 (getOrderStatusExtended \- solicitud / respuesta)

Estas interacciones son sincronizadas, es decir la parte llamante debe esperar a recibir la respuesta o timeout para seguir trabajando y también siempre van en una dirección: el Sistema del comercio se dirige a la pasarela de pago y nunca es al revés. Para que el creador del comercio pueda realizar estas interacciones el sistema de la pasarela de pago presenta dos solicitudes:

1. Registrar el pedido  
2. Obtener la información sobre el estado del pedido El sistema presenta dos realizaciones de API:  
   * Realización en WebService-ах (SOAP)

   * Realización en REST

#### **Notas:**

* Desde el momento de registro del pedido por el comercio se dan 20 minutos para realizar el pago. Al intentar pagarlo después del plazo transcurrido saldrá una página con error.

  * El botón de pagos debe desarrollarse bajo el método tradicional. Esto quiere decir que la ventana emergente tipo modal no es permitida.

  3. **Esquema de interacción al pagar**  
     **con “API”**  
     

Descripción:

1. El cliente interactúa con el comercio para crear el pedido en el comercio.

2. Después de que el cliente confirme el pedido el sistema de la gateway registra el pedido en la pasarela de pago. Para el registro se utilizan los parámetros del importe del pago, la divisa, el número de pedido en el sistema del comercio y la URL de la devolución del cliente.  
3. Al recibir la solicitud de registro la pasarela de pago devuelve el identificador único del pedido en el sistema de pago.  
4. Puerta de enlace proporciona un cliente con página de pago.

5. El cliente proporciona la puerta de enlace con datos de la tarjeta.  
6. Al recibir los requisitos de pago (número de tarjeta, etc.), el sistema de puerta de enlace solicita a iPay que cargue la cuenta del cliente.  
7. iPay carga la cuenta del cliente.  
8. iPay proporciona una respuesta a la puerta de enlace.

9. El sistema de la gateway pide a iPay el estado de pago del pedido (a través del número interno en el sistema de pago).  
10. iPay devuelve el estado del pedido.  
11. La Pasarela de pago pasa al navegador del cliente la página con los resultados del pago.

Si después de pasar los 20 minutos que se dan para el pago el cliente no ha vuelto de la pasarela de pago a la página de resultados de pago del comercio (a la URL de vuelta del cliente), el pago se considera fallido.

4. ## **Realización de esquemas de interacción por parte de la gateway** {#realización-de-esquemas-de-interacción-por-parte-de-la-gateway}

En el marco de los dos sistemas entre el sistema de la gateway y la pasarela de pago existen interacciones automáticas:

* 2, 3 (registerOrder – solicitud / respuesta)  
* 6, 8 (paymentOrder \- solicitud / respuesta)  
* 9, 10 (getOrderStatusExtended \- solicitud / respuesta)

Estas interacciones son sincronizadas o sea la parte llamante debe esperar a recibir la respuesta o timeout para seguir trabajando y también siempre van en una dirección: el Sistema de la gateway se dirige a la pasarela de pago y nunca es al revés. Para que el creador del comercio pueda realizar estas interacciones:

1. Registrar el pedido  
2. Pagar el pedido

3. Obtener la información sobre el estado del pedido El Sistema presenta dos solicitudes de API:

   * Realización en WebService-ах (SOAP)  
   * Realización en REST

**Nota:** Desde el momento de registro del pedido por el vendedor se dan 20 minutos para realizar el pago. Al intentar pagarlo después del plazo transcurrido saldrá una página con error.

7. # **ALGORITMO DE ACCIONES PARA CONECTARSE A LA PASARELA DE PAGO** {#algoritmo-de-acciones-para-conectarse-a-la-pasarela-de-pago}

1. Recepción de nombres de usuario y contraseñas al servidor de pruebas.

2. Ajuste de la página de pago.  
3. Carga del archivo desde la página de pago al servidor de pruebas.

4. Probar la capacidad de trabajo de la página de pago:

   * Con la utilización de la interfaz REST \\ interfaz en las páginas web  
   * Con la utilización del formulario de registro del pedido  
   * Con la utilización del espacio personal y la consola

5. Cuando esta preparada la integración póngase en contacto con el servicio técnico [(implementaciones.ecommerce@credibanco.com),](mailto:\(implementaciones.ecommerce@credibanco.com) para comprobar integración.

6. Recepción de los nombres de usuario y contraseñas en el servidor real.

7. Traspaso de su comercio para utilizar el sistema industrial.  
8. Realización de pagos de pruebas con una tarjeta de producción (se recomienda realizar el pago con una tarjeta).  
9. Realizar la anulación del pago a través del espacio personal de pago.  
10. Firma del acta de estado de preparación del comercio online.

8. # **INTERFAZ REST** {#interfaz-rest}

Las interacciones se realizan con solicitud HTTP con métodos GET o POST a URL determinadas para cada tipo (ver la sección “Coordenadas de conexión”). Los parámetros se traspasan como parámetros GET o POST solicitudes, los valores tiene que ser compatibles con la URL (o sea url encoded).

El resultado del tratamiento de la solicitud se devuelve como objeto JSON. Por ejemplo:

Para la autorización de la solicitud del comercio al sistema de la pasarela de pago se tienen que indicar el nombre y la contraseña del comercio los cuales el representante del comercio ha indicado al registrar el comercio en el sistema. El valor del nombre y la contraseña se traspasan en los parámetros siguientes:

| Nombre | Tipo | Obligatorio | Descripción |
| :---: | :---- | :---- | :---- |
| userName | AN..30 | si | Nombre de usuario del comercio obtenido al conectarse |
| password | AN..30 | si | Contraseña del comercio obtenida al conectarse |

Dependiendo del esquema de pago elegido (de una o dos etapas) se utilizan solicitudes diferentes. Más abajo se describen las solicitudes para cada esquema.

Todos los campos de texto tiene que tener el código Unicod (UTF-8).

Los símbolos especiales en la solicitud REST tienen que ser presentados conforme el código URL.

La tabla de los símbolos se puede ver aquí: [http://web-developer.name/urlcode/](http://web-developer.name/urlcode/). Por ejemplo la contraseña "qwe?rt%y" tiene que transmitirse así "qwe%0Frt%25y".

Si el código de error es errorCode=0, la solicitud fue tratada por la pasarela de pago sin errores del sistema. En este caso errorCode no indica el estado del pedido. Para obtener el estado del pedido es necesario utilizar la solicitud getOrderStatus o getOrderStatusExtended.

Las conexiones a los servicios REST se encuentran descritas en la sección **“Listado de conexiones en ambientes de prueba y producción”** de este instructivo.

1. ## **Especificaciones para probar las solicitudes REST en el navegador de Internet** {#especificaciones-para-probar-las-solicitudes-rest-en-el-navegador-de-internet}

Si en el mismo navegador se realiza a la vez la prueba de solicitudes REST y el trabajo con la consola administrativa, después de realizar cualquier solicitud REST al pasar a la pestaña del navegador del espacio personal cualquier acción en la consola lleva a un error. Para restaurar el funcionamiento correcto de la consola administrativa:

* En algunos casos es suficiente realizar la entrada al espacio personal y realizar de nuevo la autentificación;

* A veces es necesario limpiar los archivos cookie o esperar a que expire la sesión.

Se puede evitar esta situación de las siguientes maneras:

* Utilice para las solicitudes REST el régimen incognito y el trabajo en la consola administrativa realícelo en la ventana del navegador en el régimen normal;

* Para testar las solicitudes REST y el trabajo del espacio personal utilice diferentes navegadores de Internet.

  2. ## **Solicitudes utilizadas para el pago en una etapa** {#solicitudes-utilizadas-para-el-pago-en-una-etapa}

     1. ### Solicitud de registro del pedido {#solicitud-de-registro-del-pedido}

Para registrar el pedido utilice la solicitud register.do (Ir la sección **“Listado de conexiones en ambientes de prueba y producción”** para obtener más detalles de conexiones y servicios).

#### **Parámetros de solicitud:**

| Nombr e | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| userNa me | AN.. 30 | si | Nombre de usuario del comercio obtenido al conectarse |
| passw ord | AN.. 30 | si | Contraseña del comercio obtenida al conectarse |
|  orderN umber |  AN.. 32 |  si | Número (identificador) del pedido en el sistema del comercio es único para cada comercio en el sistema. Si el número del pedido se genera por parte de la pasarela de pago este parámetro no es obligatorio pasarlo **En caso de órdenes que serán pagadas a través de PSE, por disposición de ACH este campo únicamente puede ser tipo entero hasta de 35 posiciones.** |
|  amount |  N..1 2 |  si | El importe del pago que realizará el tarjetahabiente en unidades mínimas de divisa. Ejemplo: 10 mil COP (1000000) Este importe contiene los impuestos: |

| Nombr e | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
|  |  |  |  IVA (IVA.amount) Impuesto Al Consumo (IAC.amount) (aplica para comercios tipo restaurante)  Pero no contiene los valores de:  Tasa aeroportuaria (airTax.amount) (aplica para comercios tipo aerolínea) Propinas (tips.amount) (aplica para comercios tipo restaurante) Los cuales deben ser agregados cómo parámetros adicionales (jsonParams).  **Recuerde que el tarjetahiente pagará en caso que estos parámetros sean adicionados (cuando aplique): Valor total \= amount \+ airTax.amount Valor total \= amount \+ tips.amount** |
| currenc y | N3 | no | Código de la divisa del pago ISO 4217\. Si no está indicado se considera igual al código de divisa por defecto. |
|  returnU rl |  AN.. 512 |  si | La dirección a la que se tiene que redirigir al usuario en caso de un pago exitoso. La dirección tiene que estar indicada completamente incluyendo el protocolo utilizado (por ejemplo, **https://test.com** en vez de **test.com**). En caso contrario el usuario será redirigido a la siguiente dirección: **http://\<dirección\_de la pasarela\_de pago\>/\<dirección\_del vendedor\>**. |
|  failUrl |  AN.. 512 |  no | La Dirección a la cual hay que redirigir al usuario en caso de pago fallido. La dirección tiene que estar indicada completamente incluyendo el protocolo utilizado (por ejemplo, **https://test.com** en vez de **test.com**). En caso contrario el usuario será redirigido a la siguiente dirección: **http://\<dirección\_de la pasarela\_de pago\>/\<dirección\_del vendedor\>**. |
|  descrip tion |  ANS. .512 |  no | Descripción del pedido en forma libre. En el procesamiento del banco para incluir en el informe financiero del vendedor se transmiten solo los primeros 24 símbolos de este campo.  Para obtener la posibilidad de mandar este campo al procesamiento diríjase al servicio técnico. |
| langua ge |  A2 |  no | Idioma en el código ISO 639-1. Si no está indicado se utilizara el idioma indicado en la configuración del comercio como idioma por defecto (default language). |

| Nombr e | Tipo | Obligatorio | Descripción |  |  |  |
| :---- | :---- | :---- | :---- | :---: | :---- | :---- |
|  pageVi ew |  ANS. .20 |  no | Según este parámetro se determina que páginas de la interfaz de pago tiene que cargarse para el cliente. Posibles valores: DESKTOP – para cargar páginas diseñadas para ser mostradas en las pantallas del computador (en el archivo de las páginas de la interfaz de pago se realizara la búsqueda de las páginas con el nombre payment\_\<locale\>.html y errors\_\<locale\>.html ); MOBILE – para cargar páginas diseñadas para ser mostrarlas en las pantallas de los celulares (en el archivo de las páginas de la interfaz de pago se realizara la búsqueda de las páginas con el nombre mobile\_payment\_\<locale\>.html y mobile\_errors\_\<locale\>.html ); Si el comercio ha creado páginas de la interfaz de pago añadiendo al nombre de los archivos de las páginas prefijos libres, traspase el valor del prefijo necesario en el parámetro pageView para cargar la página correspondiente. Por ejemplo al pasar el valor iphone en el archivo de las páginas de la interfaz de pago se realizara la búsqueda de páginas con el nombre iphone\_payment\_\<locale\>.html y iphone\_error\_\<locale\>.html. Dónde: locale – es el idioma de la página con el código ISO 639-1. Por ejemplo «ES» para el español o «EN» para el inglés. Si no hay parámetro o no corresponde al formato se considerara por defecto pageView=DESKTOP. |  |  |  |
|  clientId |  ANS. .255 |  no | El número (identificador) del cliente en el sistema del comercio. Se utiliza para la función de los enlaces. Puede estar presente si el comercio tiene permiso para crear enlaces.   Es necesario indicar este parámetro en los pagos por enlace, en caso contrario el pago será fallido. |  |  |  |
| mercha ntLogin | AN.. 255 | no | Para registrar el pedido en nombre de la filial del vendedor introduzca el nombre de usuario en este parámetro. |  |  |  |
|  jsonPa rams |  AN.. 1024 |  sí | Bloque con los atributos de traspaso de los parámetros adicionales del vendedor. Los campos de la información adicional para su almacenaje futuro: {"\<name1\>":"\<value1\>",...,"\<nameN\>":"\<valueN\>"},  **¡**A continuación se muestra la lista de parámetros obligatorios**\!** |  |  |  |
|  |  |  | **Nombre** | **Tipo** | **Obligatorio** | **Descripción** |
|  |  |  | installments | N..2 | sí | Número de cuotas |

| Nombr e | Tipo | Obligatorio | Descripción |  |  |  |
| :---- | :---- | :---- | ----- | ----- | :---- | :---- |
|  |  |  | IVA.amount | N..12 | sí | IVA amount en unidades mínimas de divisa |
|  |  |  | IAC.amount | N..12 | no | IAC amount en unidades mínimas de divisa |
|  |  |  | airTax.amou nt | N..12 | no | Impuesto de aeropuerto en unidades mínimas de divisa  En caso de incluir este parámetro será sumado al valor ingresado en el campo amount. |
|  |  |  | tips.amount | N..12 | no | Propina en unidades mínimas de divisa  En caso de incluir este parámetro será sumado al valor ingresado en el campo amount. |
|  |  |  | airlineCode | ANS.. 3 | no | ID\_AEROLINEA |
|  |  |  | airlineName | AN..25 5 | no | Nombre de aerolínea |
|  |  |  | commerceCo de | N..20 | no | Código de comercio |
|  |  |  |  Estos campos pueden ser dirigidos al procesamiento del banco para   su   futura   visibilidad   en   los   registros.\*  La activación de esta función es posible en conformidad con el banco durante el período de integración.  Si para el vendedor se ha ajustado el envío de notificaciones al comprador la dirección de correo electrónico del comprador tiene que enviarse en esta etiqueta en el parámetro con el nombre email. **En caso que la terminal este vinculada al servicio de control de fraude Cybersource, se deben agregar los objetos del campo jsonParams descrito en la sección 8.2.1.1.** |  |  |  |

| Nombr e | Tipo | Obligatorio | Descripción |
| :---- | ----- | :---- | :---- |
|  sessio nTimeo utSecs |  N...9 |  no | Durabilidad de la vida del pedido en segundos. En caso de que el parámetro no ha sido indicado se utilizara el valor indicado en la configuración del vendedor o el tiempo por defecto (1200 segundos \= 20 minutos). Si en la solicitud aparece el parámetro expirationDate, el valor del parámetro sessionTimeoutSecs no se toma en cuenta. |
|  expirati onDate |  ANS |  no | Fecha y hora de finalización de la vida del pedido. Formato: yyyy- MM-dd'T'HH:mm:ss. Si este parámetro no aparece en la solicitud para determinar la hora de finalización de la vida del pedido se utiliza sessionTimeoutSecs. |
|  binding Id |  AN.. 255 |  no | El identificador del enlace creado antes. Se puede utilizar solo en caso de que el comercio tenga el permiso de trabajar con enlaces. Si este parámetro se transmite en esta solicitud, esto significa que: Este pedido puede ser pagado solo con ayuda del enlace; El pagador será redirigido a la página de pago donde se necesita solo introducir el CVC. |
|  feature s |  ANS. .255 |  no | El contenedor para el parámetro feature, en el cual se pueden indicar los siguientes valores. AUTO\_PAYMENT – El pago se realiza sin la comprobación de la identidad del titular de la tarjeta (sin CVC). Para realizar pagos de este tipo tiene que tener los permisos correspondientes. VERIFY – Si indica este valor después de la solicitud de registro del pedido se realizará la verificación del titular de la tarjeta sin retener el dinero de su cuenta; por eso en la solicitud se puede poner un importe cero. La verificación permite comprobar que la tarjeta se encuentra en manos del titular y después cobrar de esta tarjeta los importes sin realizar la autentificación (CVC) al realizar futuros pagos.   **Especificaciones de entrega del valor VERIFY** Aunque el importe del pago se traspase con éxito en la solicitud, no se descontará de la cuenta del comprador. Después de un registro correcto el pedido tendrá el estado de ANULADO. |

**\*** Por defecto en el procesamiento del banco se pasan los campos:

* orderNumber – número de pedido en el sistema del comercio;  
* description – descripción del pedido (no más de 99 símbolos, se prohíbe para el uso %, \+, fin del renglón \\r y traslado del renglón \\n).

Si en el pedido se indica el parámetro adicional con el nombre de merchantOrderId, su valor es el que se transferirá al procesamiento en calidad del número de pedido (en vez del valor del campo orderNumber).

1. #### **Json Parameters (jsonParams) para Cybersource solicitudes REST**

En caso que la terminal este vinculada al servicio de control de fraude Cybersource, se deben agregar los siguientes objetos en el campo jsonParams descrito en la sección 8.2.1.

| Nombre | Tipo | Obligatori o | Descripción |
| :---- | :---- | ----- | ----- |
| postAd dress | AN (60) | si | Dirección de facturación de una persona (Tarjetahabiente, Comprador) |
| payerCi ty | AN (50) | si | Ciudad de facturación del tarjetahabiente |
| payerC ountry | AN (2) | si | Pais de facturación del tarjetahabiente (Código ISO) |
| payerP ostalCo de | AN (10) | si | Código postal de la dirección de facturación del tarjetahabiente, de acuerdo a la información proporcionada por la oficina postal de Colombia. |
| payerSt ate | AN (30) | si | Departamento o estado de la dirección de facturación de una persona |
|  docTyp e |  AN (3) |  si | Tipo	de	documento	de	una	persona CC	Cédula de ciudadanía NIT	Nit de compañia CE	Cédula de extranjería TI	Tarjeta de identidad (para menores) PP	Pasaporte IDC	Identificador Único de Cliente RC	Registro civil de nacimiento DE	Documento de Identificación Extranjero |
| docVal ue | AN (30) | si | Número de documento de una persona |
| phone | AN (20) | si | Número celular del tarjetahabiente (Siempre anteponer el carácter “+”	más	prefijo	de	país) Ejemplo: \+57301333666 |
| email | AN (100) | si | Correo electrónico del tarjetahabiente |
| shippin gAddre ss | AN (60) | si | Dirección de envío del tarjetahabiente |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | ----- | ----- | :---- | :---- | ----- | :---- | :---- | :---- | :---- | ----- | ----- | :---- | :---- |
|  flightDe tails |  AN (1024) |  no |  | **Nombre** | **Tipo** | **Obligat orio** | **Descripción** |  |  |  |  |  |  |  |
|  |  |  |  | airlineCode | AN (10) | Si | Código de la aerolínea |  |  |  |  |  |  |  |
|  |  |  |  | airlineNam e | AN (50) | Si | Nombre de la aerolínea |  |  |  |  |  |  |  |
|  |  |  |  | travelAgen cyName | AN (50) | Si | Nombre del comercio agencia de viajes |  |  |  |  |  |  |  |
|  |  |  |  | journeyTyp e | AN (20) | Si | Tipo de viaje por ejemplo ida o ida y regreso |  |  |  |  |  |  |  |
|  |  |  |  | origin | AN (6) | si | Código IATA del aeropuerto origen del vuelo |  |  |  |  |  |  |  |
|  |  |  |  | destination | AN (6) | si | Código IATA del aeropuerto destino del vuelo |  |  |  |  |  |  |  |
|  |  |  |  |  departureD TM |  AN (25) |  si | Fecha de salida del vuelo. Utilice GMT en lugar de UTC o utilice la zona horaria local (AAAA-MM-DD hh:mm a z). hh \= hora en formato de 12 horas a \= am o pm (no distingue entre mayúsculas y minúsculas) z \= zona horaria del vuelo de salida Ejemplos: 2011-03-20 11:30 PM PDT 2011-03- 20 11:30 pm GMT 2011-03-20 11:30 pm GMT-05: 00 |  |  |  |  |  |  |  |
|  |  |  |  |  arriveDTM |  AN (8) |  Si | Fecha	de	llegada	del	vuelo (AAAAMMDD) Ejemplo: 20110805 |  |  |  |  |  |  |  |
|  |  |  |  | reservation | AN (20) | Si | Código de la reserva del vuelo |  |  |  |  |  |  |  |
|  |  |  |  |  personList |  Lista |  Si |  | **Nombre** | **Tipo** |  | **Obligat orio** | **Descripción** |  |  |
|  |  |  |  |  |  |  |  | name s | AN (20) |  | Si | Nombre (s)	del pasajero |  |  |
|  |  |  |  |  |  |  |  | lastNa me | AN( 20\) |  | Si | Apellido (s)	del pasajero |  |  |
|  |  |  |  |  |  |  |  |  perso nDoc ument |  AN (30) |  |  Si | Número de documen to	de identidad |  |  |
|  |  |  |  |  contactList |  Lista |  Si |  | **Nombre** |  | **Tipo** | **Obligat orio** | **Descripción** |  |  |
|  |  |  |  |  |  |  |  |  email |  | AN (20 ) |  Si | Correo electrónic o	del pasajero |  |  |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | ----- | :---- | ----- | :---- | :---- | :---- | :---- | ----- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |  |  cellPho neNum ber |  AN (20 ) |  si | Número celular del pasajero (Siempre antepone r	el carácter “+”	más prefijo de país) Ejemplo: \+573013 33666 |  |  |
|  |  |  |  |  completeR oute |  AN (100) |  Si | Concatenación de tramos de viaje individuales en el formato ORIG 1- DEST1 \[: ORIG2-DIST2…: ORIGin- DESTin\], por ejemplo, SFO-JFK: JFK-LHR: LHR-CDG. |  |  |  |  |  |  |
|  |  |  |  |  passenger Status |  AN (40) |  Si | Clasificación de pasajeros de su empresa, como con un programa de viajero frecuente. En este caso, puede  utilizar  valores  como estándar, oro o platino. |  |  |  |  |  |  |
|  |  |  |  |  passenger Type |  AN (40) |  Si | Clasificación de pasajeros asociada al precio del billete. Puede utilizar uno de los siguientes valores: ADT: adulto CNN: Niño INF: Infante YTH: Juventud STU: Estudiante SCR: Mayor de 65 años MIL: Militar |  |  |  |  |  |  |

#### **Parámetros de respuesta:**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| orderId | ANS36 | no | Número de pedido en el sistema de pago. Único en el sistema. No se indica si el registro del pedido no ha sido posible por culpa de un error, detallado en ErrorCode. |
| formUrl | AN..512 | no | URL del formulario de pago al cual hay que redirigir el navegador del cliente. No se devuelve si el registro del pedido no ha sido posible por culpa del error detallado en ErrorCode. |
| errorCode | N3 | Si | Código de error. |

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| errorMessage | AN..512 | no | Descripción del error en el idioma indicado en el parámetro Language en la solicitud. |

#### **Códigos de errores (campo errorCode):**

Clasificación de errores:

| Valor | Descripción |
| :---- | :---- |
| 0 | Tratamiento de la solicitud sin errores del sistema |
| 1 | El pedido con este número ya está registrado en el sistema |
| 3 | Divisa desconocida (prohibida) |
| 4 | No está el parámetro obligatorio de la solicitud |
| 5 | Error del valor del parámetro de la solicitud |
| 7 | Error del sistema |

Descifrado:

| Valor | Descripción |
| :---- | :---- |
| 0 | Tratamiento de la solicitud realizado sin errores del sistema |
| 1 | El pedido con este número ya está procesado |
| 1 | El pedido con este número ha sido registrado pero no ha sido pagado |
| 1 | Número de pedido incorrecto |
| 3 | Divisa desconocida |
| 4 | El número de pedido no puede estar vacío |
| 4 | El nombre del vendedor no puede estar vacío |
| 4 | No hay importe |
| 4 | URL de devolución no puede estar vacía |
| 4 | La contraseña no puede estar vacía |
| 5 | Valor incorrecto de uno de los parámetros |
| 5 | Acceso denegado |
| 5 | El usuario tiene que cambiar la contraseña |
| 5 | Acceso denegado |
| 5 | \[jsonParams\] incorrecto |
| 7 | Error de sistema |
| 13 | El vendedor no tiene derecho a realizar pagos de comprobación |
| 14 | Las características son incorrectas |

#### **Ejemplo de solicitud GET:**

#### **Ejemplo de solicitud POST:**

#### **Ejemplo de respuesta:**

2. ### Solicitud de registro del pedido para comercios de viajes (MCC 4722\) con dispersión {#solicitud-de-registro-del-pedido-para-comercios-de-viajes-(mcc-4722)-con-dispersión}

Para registrar el pedido utilice la solicitud register.do (Ir la sección **“Listado de conexiones en ambientes de prueba y producción”** para obtener más detalles de conexiones y servicios).

Tenga en cuenta que las dos órdenes (Agencia y Aerolinea) deben ser aprobadas simultáneamente por el sistema cuando el tarjetahabiente haga el pago, con el fin de que queden registradas en el sistema. Escenarios:

* Si la primera transacción generada por el sistema es negada por parte del emisor, entonces la segunda transacción no será enviada y será rechazado el pago total (Valor del tiquete \+ Valor de la agencia). No existen aprobaciones parciales.  
* Si la primera transacción es aprobada, el sistema permite que se genere la segunda transacción y si esta ultima es negada por parte del emisor, se generará un rechazo total de ambas transacciones (Valor del tiquete \+ Valor de la agencia). No existen aprobaciones parciales.

![C:\\Users\\navarro\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.MSO\\C2820DBD.tmp][image2]

* #### **Para comercios con MCC 4722 y dispersión de fondos (venta de tiquete aéreo \+ venta de agencia de viajes) no se permiten pagos con PSE**

#### **Parámetros de solicitud:**

| Nombre | Tipo | Obligatori o | Descripción |
| :---- | :---- | :---- | ----- |
| userName | AN..30 | si | Nombre de usuario del comercio obtenido al conectarse |
| password | AN..30 | si | Contraseña del comercio obtenida al conectarse |
| merchantOrderNum ber | AN..32 | si | Número (identificador) del pedido en el sistema del comercio es único para cada comercio en el sistema. Si el número del pedido se genera por parte de la pasarela de pago este parámetro no es obligatorio pasarlo |
| returnUrl | AN..512 | si | La dirección a la que se tiene que redirigir al usuario en caso de un pago exitoso. La dirección tiene que estar indicada completamente incluyendo el protocolo utilizado (por ejemplo, **https://test.com** en vez de **test.com**). En caso contrario el usuario será redirigido a la siguiente dirección: **http://\<dirección\_de la pasarela\_de pago\>/\<dirección\_del vendedor\>**. |
| description | ANS..51 2 | no | Descripción del pedido en forma libre. En el procesamiento del banco para incluir en el informe financiero del vendedor se transmiten solo los primeros 24 símbolos de este campo.  Para obtener la posibilidad de mandar este campo al procesamiento diríjase al servicio técnico. |
| language | A2 | no | Idioma en el código ISO 639-1. Si no está indicado se utilizará el idioma indicado en la configuración del comercio como idioma por defecto (default language). |
| clientId | ANS..25 5 | no | El número (identificador) del cliente en el sistema del comercio. Se utiliza para la función de los enlaces. Puede estar presente si el comercio tiene permiso para crear enlaces.  Es necesario indicar este parámetro en los pagos por enlace, en caso contrario el pago será fallido. |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |
| :---- | :---- | :---- | ----- | :---- | ----- | :---- |
| airline | AN..102 4 | sí | **¡**A continuación se muestra la lista de parámetros obligatorios**\!** |  |  |  |
|  |  |  | **Nombre** | **Tipo** | **Obligatori o** | **Descripción** |
|  |  |  |  amount |  N..1 2 |  sí | El importe del pago que realizará el tarjetahabiente en unidades mínimas de divisa. Ejemplo: 10 mil COP (1000000) Este importe contiene los impuestos:  IVA (ivaAmount) Pero no contiene los valores de:  Tasa aeroportuaria (airTaxAmou nt) El cual debe ser agregado como parámetro adicional.  **Recuerde que el tarjetahiente pagará en caso que estos parámetros sean adicionados:** |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |  |
| :---- | :---- | :---- | ----- | :---- | :---- | ----- | :---- |
|  |  |  |  |  |  |  | **Valor total \= amount \+ airTaxAmount** |
|  |  |  |  currency |  |  N3 |  no | Código de la divisa del pago ISO 4217\. Si no está indicado se considera igual al código de divisa por defecto. |
|  |  |  | installments |  | N..2 | sí | Número de cuotas |
|  |  |  |  ivaAmount |  |  N..1 2 |  sí | Valor del IVA en unidades mínimas de divisa |
|  |  |  |  airTaxAmou nt |  |  N..1 2 |  sí | Impuesto de aeropuerto en unidades mínimas de divisa |
|  |  |  | airlineId |  | N2 | sí | ID\_AEROLINEA |
| agency | AN..102 4 | sí | **¡**A continuación se muestra la lista de parámetros obligatorios**\!** |  |  |  |  |
|  |  |  | **Nombre** | **Tipo** |  | **Obligatorio** | **Descripción** |
|  |  |  |  amount |  N..12 |  |  sí | El importe del pago en unidades mínimas de divisa Ejemplo: 10 mil COP (1000000)  Este importe contiene los impuestos: IVA (ivaAmount) |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |
| :---- | :---- | :---- | ----- | :---- | :---- | :---- |
|  |  |  |  currency |  N3 |  no | Código de la divisa del pago ISO 4217\. Si no está indicado se considera igual al código de divisa por defecto. |
|  |  |  | installments | N..2 | sí | Número de cuotas |
|  |  |  |  ivaAmount |  N..12 |  sí | IVA amount en unidades mínimas de divisa |
| sessionTimeoutSecs | N...9 | no | Durabilidad de la vida del pedido en segundos. En caso de que el parámetro no ha sido indicado se utilizara el valor indicado en la configuración del vendedor o el tiempo por defecto (1200 segundos \= 20 minutos).  Si en la solicitud aparece el parámetro expirationDate, el valor del parámetro sessionTimeoutSecs no se toma en cuenta. |  |  |  |
| expirationDate | ANS | no | Fecha y hora de finalización de la vida del pedido. Formato: yyyy-MM-dd'T'HH:mm:ss. Si este parámetro no aparece en la solicitud para determinar la hora de finalización de la vida del pedido se utiliza sessionTimeoutSecs. |  |  |  |
| bindingId | AN..255 | no | El identificador del enlace creado antes. Se puede utilizar solo en caso de que el comercio tenga el permiso de trabajar con enlaces. Si este parámetro se traspasa en esta solicitud, esto significa que:  Este pedido puede ser pagado solo con ayuda del enlace; El pagador será redirigido a la página de pago donde se necesita solo introducir el CVC. |  |  |  |
| JsonParams |  | no |  ![C:\\Users\\navarro\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.MSO\\C2820DBD.tmp][image2]  **Nota: Solo aplica para comercios con Cybersource. Ver detalle en 8.2.2.1** |  |  |  |

1. #### **Json Parameters (jsonParams) para Cybersource solicitudes REST**

En caso que la terminal este vinculada al servicio de control de fraude Cybersource, se deben agregar los siguientes objetos en el campo jsonParams descrito en la sección 8.2.2.

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |  |  |
| :---- | :---- | ----- | ----- | :---- | :---- | ----- | :---- | :---- |
| postAd | AN | si | Dirección  de  facturación  de  una  persona  (Tarjetahabiente, |  |  |  |  |  |
| dress | (60) |  | Comprador) |  |  |  |  |  |
| payerCi ty | AN (50) | si | Ciudad de facturación del tarjetahabiente |  |  |  |  |  |
| payerC ountry | AN (2) | si | Pais de facturación del tarjetahabiente (Código ISO) |  |  |  |  |  |
| payerP ostalCo de | AN (10) | si | Código postal de la dirección de facturación del tarjetahabiente, de acuerdo a la información proporcionada por la oficina postal de Colombia. |  |  |  |  |  |
| payerSt ate | AN (30) | si | Departamento o estado de la dirección de facturación de una persona |  |  |  |  |  |
|  |  |  | Tipo	de	documento	de	una	persona |  |  |  |  |  |
|  docTyp e |  AN (3) |  si | CC	Cédula de ciudadanía NIT	Nit de compañia CE	Cédula de extranjería TI	Tarjeta de identidad (para menores) PP	Pasaporte IDC	Identificador Único de Cliente RC	Registro civil de nacimiento DE	Documento de Identificación Extranjero |  |  |  |  |  |
| docVal ue | AN (30) | si | Número de documento de una persona |  |  |  |  |  |
| phone | AN (20) | si | Número celular del tarjetahabiente (Siempre anteponer el carácter “+”	más	prefijo	de	país) Ejemplo: \+57301333666 |  |  |  |  |  |
| email | AN (100) | si | Correo electrónico del tarjetahabiente |  |  |  |  |  |
| shippin gAddre ss | AN (60) | si | Dirección de envío del tarjetahabiente |  |  |  |  |  |
|  flightDe tails |  AN (1024) |  no |  | **Nombre** | **Tipo** | **Obligat orio** | **Descripción** |  |
|  |  |  |  | airlineCode | AN (10) | Si | Código de la aerolínea |  |
|  |  |  |  | airlineNam e | AN (50) | Si | Nombre de la aerolínea |  |
|  |  |  |  | travelAgen cyName | AN (50) | Si | Nombre del comercio agencia de viajes |  |
|  |  |  |  | journeyTyp e | AN (20) | Si | Tipo de viaje por ejemplo ida o ida y regreso |  |
|  |  |  |  | origin | AN (6) | si | Código IATA del aeropuerto origen del vuelo |  |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | ----- | ----- | ----- | ----- | :---- | :---- | :---- | :---- | ----- | ----- | :---- | :---- |
|  |  |  |  | destination | AN (6) | si | Código IATA del aeropuerto destino del vuelo |  |  |  |  |  |  |  |
|  |  |  |  |  departureD TM |  AN (25) |  si | Fecha de salida del vuelo. Utilice GMT en lugar de UTC o utilice la zona horaria local (AAAA-MM-DD hh:mm a z). hh \= hora en formato de 12 horas a \= am o pm (no distingue entre mayúsculas y minúsculas) z \= zona horaria del vuelo de salida |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  | Ejemplos: |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  | 2011-03-20 11:30 PM PDT 2011-03- 20 11:30 pm GMT 2011-03-20 11:30 pm GMT-05: 00 |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  | Fecha	de	llegada (AAAAMMDD) |  |  |  |  | del	vuelo |  |  |
|  |  |  |  | arriveDTM | AN (8) | Si |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  | Ejemplo: 20110805 |  |  |  |  |  |  |  |
|  |  |  |  | reservation | AN (20) | Si | Código de la reserva del vuelo |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  | **Nombre** | **Tipo** |  | **Obligat orio** | **Descripción** |  |  |
|  |  |  |  |  |  |  |  | name s | AN (20) |  | Si | Nombre (s)	del pasajero |  |  |
|  |  |  |  |  personList |  Lista |  Si |  | lastNa me | AN( 20\) |  |  Si | Apellido (s)	del pasajero |  |  |
|  |  |  |  |  |  |  |  | perso nDoc ument |  AN (30) |  |  Si | Número de documen to	de identidad |  |  |
|  |  |  |  |  |  |  |  | **Nombre** |  | **Tipo** | **Obligat orio** | **Descripción** |  |  |
|  |  |  |  |  |  |  |  |  email |  | AN (20 ) |  Si | Correo electrónic o	del pasajero |  |  |
|  |  |  |  |  contactList |  Lista |  Si |  |  cellPho neNum ber |  |  AN (20 ) |  si | Número celular del pasajero (Siempre antepone r	el carácter “+”	más prefijo de país) |  |  |

| Nombre | Tipo | Obligatori o | Descripción |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | ----- | :---- | ----- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |  |  |  |  | Ejemplo: \+573013 33666 |  |  |
|  |  |  |  |  completeR oute |  AN (100) |  Si | Concatenación de tramos de viaje individuales en el formato ORIG 1- DEST1 \[: ORIG2-DIST2…: ORIGin- DESTin\], por ejemplo, SFO-JFK: JFK-LHR: LHR-CDG. |  |  |  |  |  |  |
|  |  |  |  |  passenger Status |  AN (40) |  Si | Clasificación de pasajeros de su empresa, como con un programa de viajero frecuente. En este caso, puede utilizar valores como estándar, oro o platino. |  |  |  |  |  |  |
|  |  |  |  |  passenger Type |  AN (40) |  Si | Clasificación de pasajeros asociada al precio del billete. Puede utilizar uno de los siguientes valores: ADT: adulto CNN: Niño INF: Infante YTH: Juventud STU: Estudiante SCR: Mayor de 65 años MIL: Militar |  |  |  |  |  |  |

#### **Parámetros de respuesta:**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | ----- | :---- | :---- |
| crbOrderId | ANS36 | no | AGRUPADORA. Número del pedido en el sistema de pago. Es único en el sistema. No se utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode. Engloba las dos órdenes generadas, para la parte de AEROLINEA y AGENCIA. |
| orderId | ANS36 | no | AEROLINEA Número del pedido en el sistema de pago. Es único en el sistema. No se utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode. |
| orderId | ANS36 | no | AGENCIA Número del pedido en el sistema de pago. Es único en el sistema. No se utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode. |
| orderNumber | ANS36 | no | AEROLINEA Número de pedido de la transacción de aerolínea. |
| orderNumber | ANS36 | No | AGENCIA Número de pedido de la transacción de agencia. |
| type | ANS36 | no | Descripción del correspondiente orderId AEROLINEA O AGENCIA |

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| formUrl | AN..512 | no | URL del formulario de pago al cual hay que redirigir el navegador del cliente. No se devuelve si el registro del pedido no ha sido posible por culpa del error detallado en ErrorCode. |
| errorCode | N3 | Si | Código de error. |
| errorMessage | AN..512 | no | Descripción del error en el idioma indicado en el parámetro Language en la solicitud. |

#### **Códigos de errores (campo errorCode):**

Clasificación de errores:

| Valor | Descripción |
| :---- | :---- |
| 0 | Tratamiento de la solicitud sin errores del sistema |
| 1 | El pedido con este número ya está registrado en el sistema |
| 3 | Divisa desconocida (prohibida) |
| 4 | No está el parámetro obligatorio de la solicitud |
| 5 | Error del valor del parámetro de la solicitud |
| 7 | Error del sistema |

Descifrado:

| Valor | Descripción |
| :---- | :---- |
| 0 | Tratamiento de la solicitud realizado sin errores del sistema |
| 1 | El pedido con este número ya está procesado |
| 1 | El pedido con este número ha sido registrado pero no ha sido pagado |
| 1 | Número de pedido incorrecto |
| 3 | Divisa desconocida |
| 4 | El número de pedido no puede estar vacío |
| 4 | El nombre del vendedor no puede estar vacío |
| 4 | No hay importe |
| 4 | URL de devolución no puede estar vacía |
| 4 | La contraseña no puede estar vacía |
| 5 | Valor incorrecto de uno de los parámetros |
| 5 | Acceso denegado |
| 5 | El usuario tiene que cambiar la contraseña |
| 5 | Acceso denegado |
| 5 | \[jsonParams\] incorrecto |
| 7 | Error de sistema |
| 13 | El vendedor no tiene derecho a realizar pagos de comprobación |

| Valor | Descripción |
| :---- | :---- |
| 14 | Las características son incorrectas |

#### **Ejemplo de solicitud:**

#### **Ejemplo de solicitud con jsonParams para Cybersource:**

https://ecouat.credibanco.com/proxy/rest/register.do?userName=DespegarCali- api\&password=DespegarCali- api\&merchantOrderNumber=TEST11\&returnUrl=http://www.avianca.com.co\&airline={"amo unt":"100","installments":"2","ivaAmount":"1","airTaxAmount":"1","airlineId":"29 "}\&agency={"amount":"100","installments":"2","ivaAmount":"1"}\&email=scighera83@h otmail.com\&JsonParams={"postAddress" : "Calle 2 %23 3","payerCity" : "my-CITY- 666","payerCountry" : "RU","payerPostalCode" : "6666","payerState" : "66","description" : "4","docType" : "NIT","docValue" : ["11f","phone":"+79647782286","email":"mm@test.ru","shippingAddress":"ship](mailto:mm@test.ru) address","flightDetails":"{\\"airlineCode\\": \\"VH\\",\\"airlineName\\": \\"COPA VIVACOLOMBIA\\",\\"travelAgencyName\\": \\"JIREH TRAVEL1\\",\\"journeyType\\": \\"Round Trip\\",\\"origin\\": \\"BOG\\",\\"destination\\": \\"LIM\\",\\"departureDTM\\": \\"2020-12-

13 02:00 pm GMT-05:00\\",\\"arriveDTM\\": \\"20201202\\",\\"reservation\\":  
\\"QZZVLF\\",\\"personList\\": \[{\\"names\\": \\"CARMEN\\",\\"lastName\\":

\\"VALENZUELA\\",\\"personDocument\\": \\"9561431\\"},{\\"names\\":  
\\"CRISTINA\\",\\"lastName\\": \\"LOPEZ\\",\\"personDocument\\":

\\"9561431\\"}\],\\"contactList\\": \[{\\"email\\":  
\\["guillermo.cepeda@hotmail.com\\](mailto:guillermo.cepeda@hotmail.com)",\\"cellPhoneNumber\\":  
\\"+79647782222\\"},{\\"email\\": \\["manuel.cepeda@hotmail.com\\](mailto:manuel.cepeda@hotmail.com)",\\"cellPhoneNumber\\":

\\"+79647782222\\"}\],\\"completeRoute\\": \\"BOG-LIM:LIM-BOG\\",\\"passengerStatus\\":  
\\"ADT\\",\\"passengerType\\": \\"SILVER\\"}"

#### **Ejemplo de respuesta:**

3. ### Solicitud de anulación del pago del pedido {#solicitud-de-anulación-del-pago-del-pedido}

Para hacer la anulación se utiliza la solicitud refund.do. (Ir la sección **“Listado de conexiones en ambientes de prueba y producción”** para obtener más detalles de conexiones y servicios).

\*Para comercios de agencias de viaje (MCC 4722\) se puede hacer la anulación de la orden de Agencia o Aerolinea, por lo tanto en la solicitud se debe ingresar el orderId que se quiere anular.

Con esta solicitud el dinero del pedido indicado se devuelve al pagador. La solicitud acabara en error en el caso de que el dinero de este pedido no ha sido cargado.

Para realizar la operación de anulación es necesario tener los derechos correspondientes en el sistema.

La función de anulación está disponible durante un tiempo determinado después del pago, los plazos exactos se pueden pedir en Credibanco.

La operación de anulación del pago se puede realizar solo una vez. Si acaba con error una segunda operación de anulación de pago será imposible.

#### **Parámetros de solicitud:**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| userName | AN..30 | si | Nombre de usuario del comercio obtenido al conectarse |
| password | AN..30 | si | Contraseña del comercio obtenida al conectarse |
| orderId | ANS36 | si | Número de pedido en el sistema de pago. Único en el sistema |
| amount | N..12 | si | El importe del pago en unidades mínimas de divisa  **Recuerde que el tarjetahiente pagó (en caso que estos parámetros fueron adicionados):** |

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
|  |  |  | **Valor total \= amount \+ airTax.amount Valor total \= amount \+ tips.amount El importe de la anulación debe ser igual al valor total, no se permiten anulaciones parciales.** |

#### **Parametros de respuesta:**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| errorCode | N3 | Si | Código de error. |
| errorMessage | AN..512 | no | Descripción del error en el idioma. |

#### **Códigos de errores (campo ErrorCode):**

Clasificación:

| Valor | Descripción |
| :---- | :---- |
| 0 | Tratamiento de la solicitud sin errores del sistema |
| 5 | Error del valor del parámetro de la solicitud |
| 6 | OrderId no registrado |
| 7 | Error del sistema |

Descifrado:

| Valor | Descripción |
| :---- | :---- |
| 0 | El tratamiento de la solicitud se ha efectuado son errores del sistema |
| 5 | Acceso denegado |
| 5 | El usuario tiene que cambiar la contraseña |
| 5 | \[orderId\] no indicado |
| 6 | Número de pedido incorrecto |
| 7 | El pago debe ser correcto |
| 7 | Importe del depósito incorrecto (menos de un pesos) |
| 7 | Error del sistema |

#### **Ejemplo de solicitud GET:**

#### **Ejemplo de solicitud POST:**

#### **Ejemplo de respuesta:**

4. ### Solicitud ampliada del estado del pedido {#solicitud-ampliada-del-estado-del-pedido}

Para pedir el estado del pedido registrado se utiliza la solicitud getOrderStatusExtended. La descripción del método se puede ver en el servicio WSDL. (Ir la sección **“Listado de conexiones en ambientes de prueba y producción”** para obtener más detalles de conexiones y servicios).

#### **Parámetros de la solicitud:**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| orderId\* | ANS36 | sí\*\* | Número de pedido en el sistema de pago. Único en el sistema |
| language | A2 | no | El idioma en el código ISO 639-1. Si no está indicado se considera el idioma español. La notificación sobre el error se devuelve en este idioma. |
| merchantOrderNumber | ANS..32 | sí\* | Número (identificador) del pedido en el sistema del comercio. |

\*Para comercios de agencias de viaje (MCC 4722\) se puede hacer la consulta ampliada de la orden de Agencia o Aerolinea, por lo tanto en la solicitud se debe ingresar el getOrderStatusExtended.do.  
\*\* En la solicitud es necesario indicar el parámetro orderId, o merchantOrderNumber. Si en la solicitud se indican los dos parámetros el parámetro orderId es superior.

Existen varios conjuntos de parámetros de respuesta. Que parámetros en concreto se devolverán depende de la versión getOrderStatusExtended, indicada en la configuración del vendedor.

#### **Parámetros de la respuesta:**

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | :---- |
|  orderNumber | AN..32 | Si | Número (identificador) del pedido en el sistema del comercio. | Todas las versiones. |

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | ----- |
|  orderStatus | N2 | no | Según el valor de este parámetro se determina el estado del pedido en el sistema de pago. La lista de los posibles valores se puede ver en la tabla más abajo. No se indica si el pedido no ha sido encontrado.  **0** – Pedido registrado pero no pagado; **1** \- El importe preautorizado está retenido (para los pagos en dos etapas); **2** \- Se ha realizado la autorización completa del importe del pedido; **3** – autorización denegada; **4** \- Se ha realizado la anulación de esta transacción; **5** – Autorización iniciada a través de ACS del banco emisor; **6** – Autorización denegada. **7** – Pendiente   ![C2820DBD][image2]  **Nota: Consulte el pedido hasta obtener un estado final (2 o 6\) mínimo durante un periodo de 30 minutos.** | Todas las versiones. |
| actionCode | N3 | Si | Código de respuesta. | Todas las versiones. |
|  actionCodeDescri ption | AN..512 | Si | Descifrado del código de respuesta en el idioma indicado en el parámetro Language en la solicitud. | Todas las versiones. |
|  errorCode | N3 | Si | Código de error. Posibles las siguientes variantes. **0** – El tratamiento de la solicitud sin errores del | Todas las versiones. |

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | ----- |
|  |  |  | sistema;  **1** – Se espera \[orderId\] o \[orderNumber\];  **5** – Acceso denegado;  **5** – El usuario tiene que cambiar la contraseña;  **6** – pedido no encontrado; **7** – Error del Sistema. |  |
|  errorMessage | AN..512 | no | Descripción del error en el idioma enviado en el parámetro Language en la solicitud. | Todas las versiones. |
|  amount | N..12 | sí | El importe del pago en unidades mínimas de divisa que ha realizado el tarjetahabiente y que ha puesto el comercio.  Este importe contiene los valores:  IVA Impuesto Al Consumo (IAC) (aplica para comercios tipo restaurante) No incluye:  Tasa aeroportuaria (aplica para comercios tipo aerolínea y agencias de viaje con dispersión) Propina (aplica para comercios tipo restaurante) | Todas las versiones. |
|  currency | N3 | no | Código de la divisa del pago ISO 4217\. Si no se indica se considera igual a 170 (COP). | Todas las versiones. |
| date | ANS | si | Fecha de registro del pedido. | Todas las versiones. |

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | :---- |
| orderDescription | AN..512 | no | Descripción del pedido enviada durante el registro | Todas las versiones. |
| ip | AN..20 | si | Dirección IP del comprador. | Todas las versiones. |
|  El *elemento* merchantOrderParams se indica en la respuesta en caso de que en el pedido haya parámetros adicionales del vendedor. Cada parámetro adicional del pedido se presenta en un elemento aparte merchantOrderParams*.* |  |  |  |  |
| name | AN..20 | no | Nombre del parámetro adicional | Todas las versiones |
| value | AN..1024 | no | Valor del parámetro adicional | Todas las versiones |
|  *Elemento* cardAuthInfo *– en el elemento se encuentra la estructura que se compone de la lista del elemento* secureAuthInfo *y los siguientes parámetros:* |  |  |  |  |
|  maskedPan | N..19 | no | Numero oculto de la tarjeta que se ha utilizado para el pago. Se indica solo después del pago del pedido | Todas las versiones. |
|  expiration | N6 | no | Plazo de vigencia de la tarjeta en formato YYYYMM. Se indica solo después del pago del pedido. | Todas las versiones. |
|  cardholderName | A..64 | no | Nombre del titular de la tarjeta. Se indica solo después del pago del pedido. | Todas las versiones. |
|  approvalCode | AN6 | no | Código de autorización del pago. Campo de longitud determinada (6 símbolos), puede contener cifras y letras latinas. Se indica solo después del pago del pedido. | Todas las versiones. |
|  chargeback | A..5 | no | Se ha devuelto el dinero al comprador por el banco. Son posibles los siguientes valores. **true** (verdadero); **false** (falso). | 06 y más altas. |
|  paymentSystem | N..10 | sí | Nombre del sistema de pago. están disponibles las siguientes variantes. **VISA**; **MASTERCARD**; | 08 y más altas. |

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  | **AMEX**; **JCB**; **CUP**; **MIR**. |  |
|  product | AN..255 | sí | Información adicional sobre las tarjetas corporativas. Estos datos se indican por el servicio técnico en la consola de mando. Si estos datos no se indican se devuelve el campo vacío del valor. | 08 y más altas. |
|  paymentWay | AS..14 | si | Método de pago (pago con indicación de los datos de la tarjeta, pago por enlace, etc.) | 09 y más altas. |
|  *Elemento* secureAuthInfo *(el elemento se compone del elemento* eci *y el elemento* threeDSInfo*, que es la lista de los parámetros* cavv *y* xid*):* |  |  |  |  |
|  ECI | N..4 | no | Indicador electrónico comercial. Indicado solo después del pago del pedido y en caso de tener el permiso correspondiente. | Todas las versiones. |
|  CAVV | ANS..200 | no | Valor de la comprobación de la autentificación del titular de la tarjeta. Indicado solo después del pago del pedido y en caso de tener el permiso correspondiente. | Todas las versiones. |
|  XID | ANS..80 | no | Indicador electrónico de la transacción. Indicado solo después del pago del pedido y en caso de tener el permiso correspondiente. | Todas las versiones. |
|  *Elemento* bindingInfo *se compone de los parámetros:* |  |  |  |  |
|  clientId | ANS..255 | no | Número (identificador) del cliente en el sistema del comercio, indicado durante el registro del pedido. Se indica solo si el comercio tiene permiso a crear enlaces | Todas las versiones. |

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | :---- |
|  bindingId | AN..255 | no | Identificador de enlaces creados durante el pago del pedido o utilizados para el pago. Se indica solo si el comercio tiene permiso para crear enlaces | Todas las versiones. |
| authDateTime | ANS | no | Fecha/hora de la autorización | 02 y más altas. |
|  authRefNum | AN..24 | no | Número de autorización del pago que se asigna durante el registro del pago. | 02 y más altas. |
| terminalId | AN..10 | no | Id de la terminal | 02 y más altas. |
|  *Elemento* paymentAmountInfo *se compone de parámetros:* |  |  |  |  |
|  approvedAmount | N..12 | no | Importe retenido en la tarjeta (se utiliza en pagos en dos etapas) | 03 y más altas. |
| depositedAmount | N..12 | no | Importe confirmado para cargarlo en la tarjeta | 03 y más altas. |
| refundedAmount | N..12 | no | Importe de la anulación. | 03 y más altas. |
|  totalAmount | N..12 | no | Importe cargado en la cuenta del tarjetahiente.  El importe del pago en unidades mínimas de divisa que ha realizado el tarjetahabiente Este importe contiene los valores: IVA Impuesto Al Consumo (IAC) (aplica para comercios tipo restaurante) Tasa aeroportuaria (aplica para comercios tipo aerolínea y agencias de viaje con dispersión) Propinas (aplica para comercios tipo restaurante) | 18 |
| paymentState | A..10 | no | Estado del pedido. | 03 y más altas. |
| feeAmount | N..12 | no | Importe de la comisión. | 11 y más altas. |

|  Nombre | Tipo | Obliga torio | Descripción | versión getOrderStatusExten ded |
| :---- | :---- | :---- | :---- | :---- |
|  *Elemento* bankInfo *se compone de parámetros:* |  |  |  |  |
| bankName | AN..200 | no | Nombre del banco emisor | 03 y más altas. |
| bankCountryCode | AN..4 | no | Código del país del banco emisor | 03 y más altas. |
|  bankCountryNam e | AN..160 | no | Nombre del país del banco emisor en el idioma indicado en el parámetro language de la solicitud o en el idioma del usuario que ha reclamado el método, en caso de que en la solicitud no este indicado el idioma. | 03 y más altas. |
| *Elemento* pseInfo *se compone de parámetros:* |  |  |  |  |
| financialInstitution Code | N..5 | No | Corresponde al código de la Entidad Financiera activa en PSE (Ver Anexo 3\) | 03 y más altas. |
|  traceabilityCode | N..10 | No | CUS \- Número único asignado por PSE a cada transacción | 03 y más altas. |
|  userType | N..2 | No | Tipo de persona que está realizando el pago, los valores deben ser 0 para persona natural y 1 para persona jurídica, este se utiliza para direccionar al usuario a la banca correspondiente (personas o empresas) | 03 y más altas. |
|  docType | A..4 | No | CC \- cedula de ciudadanía NIT \- Nit de la Empresa CE \- Cedula de Extranjería TI \- Tarjeta de Identidad PP \- Pasaporte | 03 y más altas. |
| docNumber | N..12 | No | Número de documento del cliente | 03 y más altas. |

#### **Ejemplo de solicitud:**

#### **Ejemplo de respuesta:**

\<soap:Envelope [xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\>](http://schemas.xmlsoap.org/soap/envelope/)

\<soap:Body\>  
\<ns1:getOrderStatusExtendedResponse [xmlns:ns1="http://engine.paymentgate.com/webservices/merchant"\>](http://engine.paymentgate.com/webservices/merchant)

\<return orderNumber="0s7a84sPe49Hdsddd0134567a0" orderStatus="2" actionCode="0" actionCodeDescription="Request processed successfully" amount="33000" currency="170" date="2013-11-13T16:51:02.785+04:00"  
orderDescription=" " errorCode="0" errorMessage="Success"\>

\<attributes name="mdOrder" value="942e8534-ac73-4e3c-96c6- f6cc448018f7"/\>

\<cardAuthInfo maskedPan="411111\*\*1111" expiration="201512" cardholderName="Ivan" approvalCode="123456"/\>  
\<authDateTime\>2013-11-13T16:51:02.898+04:00\</authDateTime\>  
\<terminalId\>111113\</terminalId\>  
\<authRefNum\>111111111111\</authRefNum\>

\<paymentAmountInfo paymentState="DEPOSITED" approvedAmount="33000" depositedAmount="33000" refundedAmount="0"/\>

\<bankInfo bankName="TEST CARD" bankCountryCode="CO" bankCountryName="Columbia"/\>

\</return\>  
\</ns1:getOrderStatusExtendedResponse\>

\</soap:Body\>

\</soap:Envelope\>

#### **Ejemplo de respuesta PSE:**

\<soap:Envelope [xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\>](http://schemas.xmlsoap.org/soap/envelope/)

\<soap:Body\>

\<ns1:getOrderStatusExtendedResponse [xmlns:ns1="http://engine.paymentgate.ru/webservices/merchant"\>](http://engine.paymentgate.ru/webservices/merchant)

\<return orderNumber="1557043" orderStatus="6" actionCode="302" actionCodeDescription="" amount="15000" currency="170" date="2020-07- 06T17:45:22.841+03:00" orderDescription="TEST TEST" ip="186.84.21.21"

errorCode="0" errorMessage="Éxito"\>

\<merchantOrderParams name="IVA.amount" value="0"/\>

\<attributes name="mdOrder" value="d689410e-d508-7add-b671- 57800007a120"/\>

\<terminalId\>00004451\</terminalId\>

\<paymentAmountInfo paymentState="DECLINED" approvedAmount="0" depositedAmount="0" refundedAmount="0" feeAmount="0"/\>

\<bankInfo bankCountryCode="UNKNOWN" bankCountryName="\&amp;ltUnknown\&amp;gt"/\>

\<payerData [email="navarro@bpcbt.com"/\>](mailto:navarro@bpcbt.com)

\<chargeback\>false\</chargeback\>

\<paymentWay\>PSE\</paymentWay\>

\<pseInfo financialInstitutionCode="1022" traceabilityCode="1817079" userType="0" docType="CC" docNumber="7178211"/\>

\</return\>

\</ns1:getOrderStatusExtendedResponse\>

\</soap:Body\>

\</soap:Envelope\>

#### **Como determinar los estados de las transacciones para el medio de pago de tarjeta:**

#### **Nota: Consulte el pedido hasta obtener un estado final (2 o 6\) mínimo durante un periodo de 30 minutos.**

*Como determinar una transacción en estado como “aprobada”:*

Para tomar determinar una transacción de compra como aprobada se debe tener las siguientes combinaciones:

* OrderStatus \= 2

*Como determinar una transacción como “rechazada”*

* OrderStatus \= 6

*Como determinar una transacción como “anulada”:*

* OrderStatus \= 4

#### **Como determinar los estados de las transacciones para el medio de pago de PSE:**

*Como determinar una transacción en estado como “aprobada”:*

Para tomar determinar una transacción de compra como aprobada se debe tener las siguientes combinaciones:

* OrderStatus \= 2

*Como determinar una transacción como “rechazada”:*

* OrderStatus \= 6

*Como determinar una transacción como “pendiente”:*

* OrderStatus \= 7

*Como determinar una transacción como “fallida”:*

* OrderStatus \= 6

NOTA: Las transacciones de PSE no se puede anular.

#### **Opción para obtener estados finales de transacciones pendientes para PSE:**

*Ejecutar sonda para buscar los estados finales de transacciones “pendientes” con PSE:*

Para las transacciones de PSE cuando se encuentra en estado “Pendiente” se debe generar una rutina del botón de pagos para ir a consultar cada 3 minutos durante 30 minutos el estado final de las transacciones con estado “pendiente”, esto con el fin de actualizar el CPANEL del botón y dejar el estado final de las transacciones donde va a ser “aprobada” o “rechazada”.

5. ### Solicitud de pago al recopilar datos de la tarjeta del lado del comercio (o gateway) {#solicitud-de-pago-al-recopilar-datos-de-la-tarjeta-del-lado-del-comercio-(o-gateway)}

Para uso de pago solicitud de paymentorder.do. La descripción del método se puede ver en el servicio WSDL. (Ir la sección **“Listado de conexiones en ambientes de prueba y producción”** para obtener más detalles de conexiones y servicios).

Solo POST es compatible.

La validación de los datos de la tarjeta se realiza de acuerdo con la tabla:

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| name | AN..20 | sí | Nombre del parámetro adicional |
| value | AN..1024 | sí | Valor del parámetro adicional |

| Nombre | Descripción | Validación |
| :---- | :---- | :---- |
| PAN | Número completo de tarjeta | Validación de Luhn (verificando si el número de tarjeta es real), la cantidad de dígitos en el número de tarjeta: de 13 a 20 |
| CVC | Código CVC | 4 dígitos |
| year, month | Año, mes de vencimiento de la tarjeta | La fecha en presente o futuro. Si el vencimiento de la tarjeta es un mes actual, el pago es posible hasta el final del mes |
| TEXT | Nombre del titular de la tarjeta | No verificado |

#### **Parámetros de solicitud:**

| Nombre | Typo | Obligatori o | Descripción |
| :---- | :---- | :---- | :---- |
| userName | AN..30 | si | Nombre de usuario del comercio obtenido al conectarse |
| password | AN..30 | si | Contraseña del comercio obtenida al conectarse |
| MDORDER | ANS36 | sí | Número del pedido en el sistema de pago. Es único en el sistema. No se utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode |
| $PAN | N..20 | sí | Número de tarjeta |
| $CVC | N..4 | sí | Código CVC |
| YYYY | N..4 | sí | Año de vencimiento |
| MM | N..2 | sí | Meses de vencimiento |
| TEXT | A..512 | sí | Nombre del titular de la tarjeta |
| language | A..2 | sí | El idioma en el código ISO 639-1. Si no está indicado se considera el idioma español. La notificación sobre el error se devuelve en este idioma. |
| ip | AN..19 | no | Dirección IP del usuario. Se indica solo después del pago. |
| email | ANS..\* | no | Email del pagador |
| jsonParam s | AN..102 4 | no | La etiqueta con los atributos de traspaso de los parámetros adicionales del vendedor. Los campos de la información adicional para su almacenaje futuro. Para pasar N parámetros en la solicitud tiene que haber N etiquetas params, donde el atributo name contiene el nombre y el atributo value contiene el valor: |

|  |  |  |  |
| :---- | :---- | :---- | :---- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

| Nombre | Typo | Obligatori o | Descripción |
| :---- | :---- | :---- | :---- |
|  |  |  | **¡**A continuación se muestra la lista de parámetros obligatorios**\! Nombre	Tipo	Obligatori	Descripción o** installments	N..2	sí	Número de cuotas IVA.amount	N..12	sí	Valor de IVA en unidades mínimas de divisa IAC.amount	N..12	no	IAC amount en unidades mínimas de divisa airTax.amount	N..12	no	Impuesto de aeropuerto en unidades mínimas de divisa tips.amount	N..12	no	Propina en unidades mínimas de divisa airlineCode	ANS..3	no	ID\_AEROLINE A airlineName	AN..25	no	Nombre de 5	aerolínea commerceCod	N..20	no	Código de e	comercio  Estos campos pueden ser dirigidos al procesamiento del banco para su futura visibilidad en los registros.\*  Si para el vendedor se ha ajustado el envío de notificaciones al comprador la dirección de correo electrónico del comprador tiene que enviarse en esta etiqueta en el parámetro con el nombre email. |

#### **Parámetros de respuesta:**

| Nombre | Typo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| errorCode | N3 | sí | Código del error. |

| Nombre | Typo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| errorMessage | AN..512 | no | Descripción del error en el idioma indicado en el parámetro language en la solicitud. |
| info | AN..512 | no | El resultado del intento de pago. Los valores posibles son los siguientes: Su pago se procesa, redirige ... La operación fue rechazada. Verifique los datos ingresados, fondos suficientes en la tarjeta y repita la operación. Redireccionando ... Lo sentimos, el pago no se puede hacer. Redireccionando ... La operación fue rechazada. Póngase en contacto con el comercio. Redireccionando ... La operación fue rechazada. Póngase en contacto con el banco que emitió la tarjeta. Redireccionando ... La operación es imposible. La autenticación del titular de la tarjeta falló. Redireccionando ... No hay conexión con el banco. Por favor intente de nuevo más tarde. Redireccionando ... La entrada de datos ha expirado. Redireccionando ... Sin respuesta del banco. Por favor intente de nuevo más tarde. Redireccionando ... |
| redirect | AN..512 | no | Dirección para la redirección del usuario |

**Códigos de errores (campo** errorCode**):**

| Valor | Descripción |
| :---- | :---- |
| 0 | El Tratamiento de la solicitud se ha realizado sin errores del sistema |
| 1 | Número del pedido equivocado |
| 1 | El pedido con el mismo número ya ha sido tratado |
| 3 | Divisa desconocida |
| 4 | No se ha indicado el importe |
| 4 | El número del pedido no puede estar vacío |
| 4 | URL de devolución no puede estar vacía |
| 5 | Se ha indicado mal el valor de uno de los parámetros |
| 5 | Importe incorrecto |
| 5 | Acceso denegado |
| 5 | El usuario tiene que cambiar su contraseña |
| 7 | Error del sistema |
| 13 | El vendedor no tiene permiso para realizar pagos de comprobación |
| 14 | Las características se han indicado incorrectamente |

#### **Ejemplo de solicitud:**

#### **Ejemplo de respuesta en caso de pago, que no requiere autenticación adicional en el ACS del banco emisor:**

6. ### Solicitud de pago al recopilar datos de la tarjeta del lado del comercio (o gateway) para comercios de viajes (MCC 4722\) {#solicitud-de-pago-al-recopilar-datos-de-la-tarjeta-del-lado-del-comercio-(o-gateway)-para-comercios-de-viajes-(mcc-4722)}

Para uso de pago solicitud de paymentorder.do. La descripción del método se puede ver en el servicio WSDL. (Ir la sección **“Listado de conexiones en ambientes de prueba y producción”** para obtener más detalles de conexiones y servicios).

Solo POST es compatible.

La validación de los datos de la tarjeta se realiza de acuerdo con la tabla:

| Nombre | Descripción | Validación |
| :---- | :---- | :---- |
| pan | Número completo de tarjeta | Validación de Luhn (verificando si el número de tarjeta es real), la cantidad de dígitos en el número de tarjeta: de 13 a 20 |
| cvc | Código CVC | 4 dígitos |
| month | mes de vencimiento de la tarjeta | La fecha en presente o futuro. Si el vencimiento de la tarjeta es un mes actual, el pago es posible hasta el final del mes |
| year | año de vencimiento de la tarjeta | La fecha en presente o futuro. Si el vencimiento de la tarjeta es un mes actual, el pago es posible hasta el final del mes |
| cardholderName | Nombre del titular de la tarjeta | No verificado |

#### **Parámetros de solicitud:**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| name | AN..20 | sí | Nombre del parámetro adicional |
| value | AN..1024 | sí | Valor del parámetro adicional |

| Nombre | Typo | Obligatori o | Descripción |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| orderId | ANS36 | sí | Número del pedido en el sistema de pago. Es único en el sistema. No se utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode |  |  |  |  |  |
| pan | N..20 | sí | Número de tarjeta |  |  |  |  |  |
| cvc | N..4 | sí | Código CVC |  |  |  |  |  |
| year | N..4 | sí | Año de vencimiento |  |  |  |  |  |
| month | N..2 | sí | Meses de vencimiento |  |  |  |  |  |
| cardholderNam e | A..512 | sí | Nombre del titular de la tarjeta |  |  |  |  |  |
| language | A..2 | sí | El idioma en el código ISO 639-1. Si no está indicado se considera el idioma español. La notificación sobre el error se devuelve en este idioma. |  |  |  |  |  |
| ip | AN..19 | no | Dirección IP del usuario. Se indica solo después del pago. |  |  |  |  |  |
| email | ANS..\* | no | Email del pagador |  |  |  |  |  |
| jsonParams | AN..102 4 | no | La etiqueta con los atributos de traspaso de los parámetros adicionales del vendedor. Los campos de la información adicional para su almacenaje futuro. Para pasar N parámetros en la solicitud tiene que haber N etiquetas params, donde el atributo name contiene el nombre y el atributo value contiene el valor:  **¡**A continuación se muestra la lista de parámetros obligatorios**\!** |  |  |  |  |  |
|  |  |  |  | **Nombre** | **Tipo** | **Obligatori o** | **Descripción** |  |
|  |  |  |  | installments | N..2 | sí | Número de cuotas |  |
|  |  |  |  | IVA.amount | N..12 | sí | Valor de IVA en unidades mínimas de divisa |  |

| Nombre | Typo | Obligatori o | Descripción |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | airTax.amount |  | N..12 |  | no |  | Impuesto de aeropuerto en unidades mínimas de divisa |  |
|  |  |  |  | airlineCode |  | ANS..3 |  | no |  | ID\_AEROLINE A |  |
|  |  |  |  | airlineName |  | AN..25 5 |  | no |  | Nombre de aerolínea |  |
|  |  |  |  | commerceCod e |  | N..20 |  | no |  | Código de comercio |  |
|  |  |  |  Estos campos pueden ser dirigidos al procesamiento del banco para su futura visibilidad en los registros.\* Si para el vendedor se ha ajustado el envío de notificaciones al comprador la dirección de correo electrónico del comprador tiene que enviarse en esta etiqueta en el parámetro con el nombre email. |  |  |  |  |  |  |  |  |
| airline |  | no |  | **Nombre** | **Tipo** |  | **Obligatorio** |  | **Descripción** |  |  |
|  |  |  |  | installments | N..2 |  | sí |  | Número de cuotas pago orden de AEROLINEA |  |  |
| agency |  | no |  | **Nombre** | **Tipo** |  | **Obligatorio** |  | **Descripción** |  |  |
|  |  |  |  | installments | N..2 |  | sí |  | Número de cuotas pago orden AGENCIA |  |  |

#### **Parámetros de respuesta:**

| Nombre | Typo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| errorCode | N3 | sí | Código del error. |
| errorMessage | AN..512 | no | Descripción del error en el idioma indicado en el parámetro language en la solicitud. |
| info | AN..512 | no | El resultado del intento de pago. Los valores posibles son los siguientes: Su pago se procesa, redirige ... La operación fue rechazada. Verifique los datos ingresados, fondos suficientes en la tarjeta y repita la operación. Redireccionando ... Lo sentimos, el pago no se puede hacer. Redireccionando ... |

| Nombre | Typo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
|  |  |  | La operación fue rechazada. Póngase en contacto con el comercio. Redireccionando ... La operación fue rechazada. Póngase en contacto con el banco que emitió la tarjeta. Redireccionando ... La operación es imposible. La autenticación del titular de la tarjeta falló. Redireccionando ... No hay conexión con el banco. Por favor intente de nuevo más tarde. Redireccionando ... La entrada de datos ha expirado. Redireccionando ... Sin respuesta del banco. Por favor intente de nuevo más tarde. Redireccionando ... |
| redirect | AN..512 | no | Dirección para la redirección del usuario |
| rbsOrderId | ANS36 | no | AGRUPADORA. Número del pedido en el sistema de pago. Es único en el sistema. No se utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode. Engloba las dos órdenes generadas, para la parte de AEROLINEA y AGENCIA. |

**Códigos de errores (campo** errorCode**):**

| Valor | Descripción |
| :---- | :---- |
| 0 | El Tratamiento de la solicitud se ha realizado sin errores del sistema |
| 1 | Número del pedido equivocado |
| 1 | El pedido con el mismo número ya ha sido tratado |
| 3 | Divisa desconocida |
| 4 | No se ha indicado el importe |
| 4 | El número del pedido no puede estar vacío |
| 4 | URL de devolución no puede estar vacía |
| 5 | Se ha indicado mal el valor de uno de los parámetros |
| 5 | Importe incorrecto |
| 5 | Acceso denegado |
| 5 | El usuario tiene que cambiar su contraseña |
| 7 | Error del sistema |
| 13 | El vendedor no tiene permiso para realizar pagos de comprobación |
| 14 | Las características se han indicado incorrectamente |

#### **Ejemplo de solicitud:**

#### **Ejemplo de respuesta:**

7. ### Solicitud consulta de estado órdenes PSE {#solicitud-consulta-de-estado-órdenes-pse}

Para consultar el estado de las órdenes PSE se puede usar la siguiente solicitud REST, status.do

Ambiente de Pruebas [https://ecouat.credibanco.com/payment/pse/status.do](https://ecouat.credibanco.com/payment/pse/status.do) Ambiente de Producción [https://eco.credibanco.com/payment/pse/status.do](https://eco.credibanco.com/payment/pse/status.do)

Método POST, Tipo de Medio (Media Type) application/json

#### **Solicitud**

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
| orderId | ANS36 | Si | Número del pedido en el sistema de pago. Es único en el sistema. No se |

| Nombre | Tipo | Obligatorio | Descripción |
| :---- | :---- | :---- | :---- |
|  |  |  | utiliza si el registro del pedido no se ha realizado por error que se detalla en errorCode. |
| language | A2 | Si | Idioma en el código ISO 639-1. |

#### **Respuesta**

| Nombre | Tipo | Obligatorio | Descripción |
| ----- | :---- | :---- | :---- |
| traceabilityCode | N..10 | No | CUS \- Número único asignado por PSE a cada transacción |
| nit | N..10 | No | Código o NIT de la empresa |
| serviceCode | N..10 | No | Código del recaudo o servicio |
| financialInstitutionCode | N..5 | No | Corresponde al código de la Entidad Financiera activa en PSE (Ver Anexo 2\) |
| financialInstitutionName |  |  | Corresponde al nombre de la Entidad Financiera activa en PSE (Ver Anexo 2\) |
| userType | N..2 | No | Tipo de persona que está realizando el pago, los valores deben ser 0 para persona natural y 1 para persona jurídica, este se utiliza para direccionar al usuario a la banca correspondiente (personas o empresas) |
| userTypeValue |  |  | 0=NATURAL 1=JURÍDICO |
| docType | A..4 | No | CC \- cedula de ciudadanía NIT \- Nit de la Empresa CE \- Cedula de Extranjería TI \- Tarjeta de Identidad PP \- Pasaporte |
| docTypeValue | A..20 | No | cedula de ciudadanía Nit de la Empresa Cedula de Extranjería Tarjeta de Identidad Pasaporte |
| docNumber | N..12 | No | Número de documento del cliente |
| ticketId | N..10 | No | Número de pedido en el sistema |
| transactionStatus | ANS..15 | No | Estado de la transacción |

| Nombre | Tipo | Obligatorio | Descripción |
| ----- | :---- | :---- | :---- |
|  |  |  | OK \- aprobada NOT\_AUTHORIZED \- indicando que el banco no autorizó la transacción. PENDING \- Pendiente FAILED \- Fallida |

#### **Ejemplo Solicitud**

{

"orderId":"7482843d-860a-78aa-8651-bfab0007a120", "language": "es"

}

#### **Ejemplo Respuesta**

{"traceabilityCode":"1817167","nit":"860032909","serviceCode":"1001","fin ancialInstitutionCode":"1022","financialInstitutionName":"BANCO UNION COLOMBIANO","userType":"0","userTypeValue":"FÍSICO","docType":"CC","docTy peValue":"Cédula de Ciudadania","docNumber":"7178211","ticketId":"1557055","transactionStatus ":"FAILED"}

9. # **NOTIFICACIONES CALLBACK** {#notificaciones-callback}

El API de la pasarela de pago le permite recibir notificaciones de devolución de llamada (callback) sobre cambios en los estados de pago de la orden.

1. ## **Información General** {#información-general}

Los comercios pueden recibir notificaciones sobre eventos relacionados con las órdenes de pago que se presentan en la tabla a continuación.

| Evento | Tipo de transacción |
| ----- | :---- |
| El dinero es depositado en la cuenta del comercio | Pago en una fase |
| La orden ha sido cancelada | Pago en una fase |
| Anulación de la orden | Pago en una fase |

#### **Notificación sin suma de verificación**

Estas notificaciones contienen solo información sobre el pedido, por lo que, es necesario que la página en dónde se recibe la notificación tenga una configuración segura HTTPS.

2. ## **Formato de URL para notificaciones de devolución de llamada (callback)** {#formato-de-url-para-notificaciones-de-devolución-de-llamada-(callback)}

#### **Notificación sin suma de verificación**

Los parámetros se muestran en la tabla a continuación. La tabla contiene solo parámetros básicos.

| Nombre	del parámetro | Descripción |
| :---- | :---- |
| mdOrder | Número único del pedido en el sistema de pago. |
| orderNumber | Número único (identificador) del pedido en el sistema del comercio |

| Nombre	del parámetro | Descripción |
| :---- | :---- |
| operation | approved – el dinero ha sido retenido de la tarjeta del comprador (pagos en dos fases – no aplica); deposited – orden aprobada; reversed – orden reversada; refunded – orden anulada |
| status | Indica si una operation ha sido procesada exitosamente: 1 – Éxito; 0 – Error. |

#### **Ejemplos**

#### **Ejemplo de una URL de notificación sin suma de verificación**

3. ## **Algoritmo para procesar notificaciones de devolución de llamada (callback)** {#algoritmo-para-procesar-notificaciones-de-devolución-de-llamada-(callback)}

Las siguientes secciones contienen algoritmos de procesamiento de notificaciones según el tipo de notificación.

1. ### Notificación sin suma de verificación {#notificación-sin-suma-de-verificación}

1. La pasarela de pago envía al servidor del comerciante la siguiente solicitud.

[https://testipay.colwebsolution.co/wordpress/credibanco/notificationCallback.php?orderNumber=21](https://testipay.colwebsolution.co/wordpress/credibanco/notificationCallback.php?orderNumber=2151&sign_alias=callbackKey&paymentState=payment_deposited&mdOrder=6a5d195d-85c4-7977-acd9-1ffb00a6ee60&operation=deposited&status=1) [51\&sign\_alias=callbackKey\&paymentState=payment\_deposited\&mdOrder=6a5d195d-85c4-7977-](https://testipay.colwebsolution.co/wordpress/credibanco/notificationCallback.php?orderNumber=2151&sign_alias=callbackKey&paymentState=payment_deposited&mdOrder=6a5d195d-85c4-7977-acd9-1ffb00a6ee60&operation=deposited&status=1) [acd9-1ffb00a6ee60\&operation=deposited\&status=1](https://testipay.colwebsolution.co/wordpress/credibanco/notificationCallback.php?orderNumber=2151&sign_alias=callbackKey&paymentState=payment_deposited&mdOrder=6a5d195d-85c4-7977-acd9-1ffb00a6ee60&operation=deposited&status=1)

2. El servidor del comercio debe devolver HTTP 200 OK a la pasarela de pago.

#### **Cuando las notificaciones fallan**

Si se devuelve una respuesta que no sea 200 OK a la pasarela de pago, la notificación se considera fallida.

En este caso, la pasarela de pago repite la notificación a intervalos de 10 \* A minutos (donde A es el número de secuencia del intento de notificación, por ejemplo, después del segundo intento, el intervalo será de 20 minutos, después del tercero \- 30 minutos, y así sucesivamente) hasta que se cumpla una de las siguientes condiciones:

* la pasarela de pago recibe 200 OK O  
  * Hay seis notificaciones callback sucesivas que fallan.

Cuando se cumple una de las condiciones anteriores, se deja de enviar notificaciones callback

10. # **LISTADO DE CONEXIONES EN AMBIENTES DE PRUEBA Y PRODUCCIÓN** {#listado-de-conexiones-en-ambientes-de-prueba-y-producción}

Al registrar al vendedor se le dan el nombre de usuario y la contraseña las cuales se pueden utilizar en el espacio personal así como en los protocolos.

1. ## **Conexiones REST** {#conexiones-rest}

URL para el acceso a los metodos REST:

1. ### Conexiones para la realización de pruebas {#conexiones-para-la-realización-de-pruebas}

| Nombre del metodo | REST URL |
| :---- | :---- |
| Registro del pedido | [https://ecouat.credibanco.com/payment/rest/register.do](https://ecouat.credibanco.com/payment/rest/register.do) |
| Solicitud de la anulación del dinero del pago del pedido | [https://ecouat.credibanco.com/payment/rest/refund.do](https://ecouat.credibanco.com/payment/rest/refund.do) |
| Solicitud de pago de pedido | [https://ecouat.credibanco.com/payment/rest/paymentorder.do](https://ecouat.credibanco.com/payment/rest/paymentorder.do) |
| Recepción del estado ampliado del pedido | [https://ecouat.credibanco.com/payment/rest/getOrderStatusExtend](https://ecouat.credibanco.com/payment/rest/getOrderStatusExtended.do) [ed.do](https://ecouat.credibanco.com/payment/rest/getOrderStatusExtended.do) |
| Solicitud de realización del pago por enlaces | [https://ecouat.credibanco.com/payment/rest/paymentOrderBinding](https://ecouat.credibanco.com/payment/rest/paymentOrderBinding.do) [.do](https://ecouat.credibanco.com/payment/rest/paymentOrderBinding.do) |

Para comercios Agencias de viajes y Tour operadores con **MCC 4722** deben realizar la conexión a: [https://ecouat.credibanco.com/proxy/rest/](https://ecouat.credibanco.com/proxy/rest/) Posteriormente indicar el nombre del servicio antes señalado en la tabla.

Ejemplo, registro del pedido: [https://ecouat.credibanco.com/proxy/rest/](https://ecouat.credibanco.com/proxy/rest/)register.do

2. ### Conexiones ambiente de producción {#conexiones-ambiente-de-producción}

| Nombre del metodo | URL |
| :---- | :---- |
| Registro del pedido | [https://eco.credibanco.com/payment/rest/register.do](https://eco.credibanco.com/payment/rest/register.do) |
| Solicitud de la anulación del dinero del pago del pedido | [https://eco.credibanco.com/payment/rest/refund.do](https://eco.credibanco.com/payment/rest/refund.do) |
| Recepción del estado ampliado del pedido | [https://eco.credibanco.com/payment/rest/getOrderStatusExtended.d](https://eco.credibanco.com/payment/rest/getOrderStatusExtended.do) [o](https://eco.credibanco.com/payment/rest/getOrderStatusExtended.do) |
| Solicitud de realización del pago por enlaces | [https://eco.credibanco.com/payment/rest/paymentOrderBinding.do](https://eco.credibanco.com/payment/rest/paymentOrderBinding.do) |

Para comercios Agencias de viajes y Tour operadores con **MCC 4722** deben realizar la conexión a: [https://eco.credibanco.com/proxy/rest/](https://eco.credibanco.com/proxy/rest/) Posteriormente indicar el nombre del servicio antes señalado en la tabla.

Ejemplo, registro del pedido: [https://eco.credibanco.com/proxy/rest/](https://eco.credibanco.com/proxy/rest/)register.do

11. # **TARJETAS DE PRUEBAS** {#tarjetas-de-pruebas}

Como nombre del titular de la tarjeta utilice dos palabras Tarjetas de pruebas:

| PAN | CVC | Expiration | Processing Response |
| :---- | :---: | :---- | :---- |
| 4444444444446666 | 123 | 2024/12 | Bloqueo por límite. |
| 4111111111111111 | 123 | 2024/12 | La Solicitud ha sido tratada con éxito. |
| 4563960122001999 | 347 | 2024/12 | La solicitud ha sido tratada con éxito. |
| 5555555555555557 | 123 | 2024/12 | El banco emisor no ha podido realizar la autorización de la tarjeta 3dsecure. |
| 5555555555555599 | 123 | 2024/12 | La solicitud ha sido tratada con éxito. |
| 639002000000000003 | 123 | 2024/12 | La solicitud ha sido tratada con éxito. |
| 4444444444444422 | 123 | 2024/12 | Formato incorrecto de la notificación. |
| 4444444411111111 | 123 | 2024/12 | Rechazo de la red realizar la transacción. |
| 4444444499999999 | 123 | 2024/12 | Error de conexión 3DS. |

12. # **ANEXO 1\. CÓDIGOS DE RESPUESTA: DESCIFRADO DE ACTIONCO(RESPUESTA DEL PROCESAMIENTO)** {#anexo-1.-códigos-de-respuesta:-descifrado-de-actionco(respuesta-del-procesamiento)}

El código de respuesta es el valor numérico del resultado que se ha obtenido por el usuario al dirigirse al Sistema. En el Sistema existen los siguientes códigos:

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| ----- | :---- | :---- | :---- | :---- |
| \-20010 | \-20010 | BLOCKED\_BY\_LIMIT | La transacción ha sido rechazado por causa de que la suma del pago es mayor que los límites establecidos por el banco emisor | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |
| \-9000 | \-9000 | Started | Estado del inicio de la transacción. | Operación rechazada. Póngase en contacto con el comercio. |
| \-3003 | \-3003 | Desconocido | Desconocido | Operación rechazada. Póngase en contacto con el comercio. |
| \-2102 | \-2102 | Bloqueo por el nombre del pasajero | Bloqueo por el nombre del pasajero | Operación rechazada. Póngase en contacto con el comercio. |
| \-2101 | \-2101 | Bloqueo por correo electrónico | Bloqueo por correo electrónico | Operación rechazada. Póngase en contacto con el comercio. |
| \-2020 | \-2020 | Se ha recibido ECI erróneo | Se ha recibido ECI erróneo. El código se facilita en caso de que el recibido por PaRes ECI no coincide con el | Operación rechazada. Póngase en contacto con el |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| ----- | :---- | :---- | :---- | :---- |
|  |  |  | valor permitido para este SPI. La regla funciona solo para Mastercard (01,02) y Visa (05,06), donde los valores entre paréntesis son los permitidos para el SIP. | banco emisor de la tarjeta / |
| \-2019 | \-2019 | Decline by iReq in PARes | PARes del emitente contiene iReq, por eso el pago ha sido rechazado | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |
| \-2018 | \-2018 | Declined. DS connection timeout | Directory server Visa o MasterCard no está disponible o la respuesta a la solicitud de la inserción de la tarjeta (VeReq) llego mensaje de error. Es un error de interacción de la pasarela de pago y los servidores del SIP por causa de desajustes técnicos de los servidores. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |
| \-2017 | \-2017 | Rechazado. Estado PARes no "Y" | Rechazado. Estado PARes- no "Y" | Operación rechazada. Póngase en contacto con el comercio |
| \-2016 | \-2016 | Declined. VeRes status is unknown | El banco emisor no ha podido determinar si la tarjeta es 3dsecure. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |
| \-2015 | \-2015 | Decline by iReq in VERes | VERes de DS contiene iReq, por esta causa el pago ha sido rechazado. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| ----- | :---- | :---- | :---- | :---- |
| \-2013 | \-2013 | Se han agotado los intentos de pago | Se han agotado los intentos de pago. | Operación rechazada. Compruebe los datos introducidos, el saldo de la tarjeta y repita la operación. |
| \-2012 | \-2012 | Operation not supported | Esta operación no se soporta. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| \-2011 | \-2011 | Declined. PaRes status is unknown | El banco emisor no puedo autorizar la tarjeta 3dsecure | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| \-2010 | \-2010 | Sin coincidencias XID | Sin coincidencias XID | Operación rechazada. Póngase en contacto con el comercio. |
| \-2008 | \-2008 | Monedero incorrecto | Monedero incorrecto. | Operación rechazada. Póngase en contacto con el comercio. |
| \-2007 | 2007 | Decline. Payment time limit | Ha expirado el plazo para introducir los datos de la tarjeta desde el momento de registro del pago (plazo por defecto 20 minutos; duración de la sesión puede estar indicada en el registro del pedido; si el comerciante tiene el privilegio “Duración de sesión no estándar” se coge el periodo | Ha expirado el tiempo de espera de los datos. |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| ----- | :---- | :---- | :---- | :---- |
|  |  |  | indicado en la configuración del comerciante). |  |
| \-2006 | 2006 | Decline. 3DSec decline | Significa que el emisor ha rechazado la autentificación (no se ha pasado la 3DS autorización) | Operación imposible. La autentificación del titular de la tarjeta ha finalizado sin éxito. |
| \-2005 | 2005 | Decline. 3DSec sign error | Significa que no hemos podido comprobar la firma del emisor, o sea el PARes estaba legible pero firmado incorrectamente | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |
| \-2003 | \-2003 | Bloque por el puerto | Bloqueo por el puerto. | Operación rechazada. Póngase en contacto con el comercio |
| \-2002 | 2002 | Decline. Payment over limit | La transacción ha sido rechazada porque la suma del pago traspasa los límites indicados. Nota: se entienden los límites del Banco receptor para el movimiento diurno del comercio o los límites del comercio para una operación. | Operación rechazada. Póngase en contacto con el comercio |
| \-2001 | 2001 | Decline. IP blacklisted | Transacción rechazada porque la dirección IP del cliente se encuentra en la lista negra. | Operación rechazada. Póngase en contacto con el comercio. |
| \-2000 | 2000 | Decline. PAN blacklisted | Transacción rechazada porque la tarjeta se encuentra en la lista negra. | Operación rechazada. Póngase en contacto con el comercio. |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
| \-102 | \-102 | Pago cancelado por el agente pagador | Pago cancelado por el agente pagador. | \- |
| \-100 | \-100 | no\_payments\_yet | No hay intentos de pago. | \- |
| \-1 | \-1 | sv\_unavailable | Ha expirado el tiempo de espera de respuesta del sistema de procesamiento. | No hay respuesta del banco. Inténtelo más tarde. |
| 0 | 0 | Approved. | Pago realizado correctamente. | \- |
| 1 | 1 | Declined. Honor with id | Para finalizar la transacción correctamente es necesario comprobar su identidad. En caso de transacción por internet (en nuestro caso) es imposible por eso se considera como declined. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 5 | 5 | Decline. Unable to process | Rechazo de la red de realizar la transacción. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 15 | 15 | DECLINED\_BY\_BADINSTIT | El SIP no pudo detectar al emisor del pago. | Error de intento de pago. Inténtelo más tarde. Si este error sale otra vez acuda a su banco para saber las causas. El telefono del banco tiene que estar indicado en el inverso de la tarjeta. |
| 53 | 53 | DECLINED\_BY\_INVALID\_ACCT | La tarjeta no existe en los sistemas de procesamiento. | Operación rechazada. Póngase en |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | contacto con el comercio. |
| 57 | 57 | Desconocido | Tipo de operación no permitido para esta tarjeta. | Operación rechazada. Póngase en contacto con el comercio |
| 100 | 100 | Decline. Card declined | Límite de tarjeta (El banco emisor ha prohibido transacciones por internet con esta tarjeta). | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 101 | 101 | Decline. Expired card | Ha expirado el plazo de vigencia de la tarjeta. | Operación rechazada. Compruebe los datos introducidos, el balance de la tarjeta y repita la operación. |
| 103 | 103 | Decline. Call issuer | No hay conexión con el banco emisor. El comercio tiene que conectar con el banco emisor. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 104 | 104 | Decline. Card declined | Intento de realizar operación con la cuenta que tiene restricciones. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 106 | 106 | Se ha superado el límite permitido de intentos de introducir el PIN. Seguramente la tarjeta este bloqueada temporalmente. | Se ha superado el límite permitido de intentos de introducir el PIN. Seguramente la tarjeta este bloqueada temporalmente. | Operación rechazada. Póngase en contacto con el comercio. |
| 107 | 107 | Decline. Call issuer | Póngase en contacto con el banco emisor. | Operación rechazada. Póngase en contacto con el |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | banco emisor de la tarjeta. |
| 109 | 109 | Decline. Invalidnj merchant | Identificador del comerciante/terminal erróneo o ACC bloqueada en el nivel de procesamiento | Operación rechazada. Póngase en contacto con el comercio. |
| 110 | 110 | Decline. Invalid amount | Suma de transacción incorrecta. | Operación rechazada. Póngase en contacto con el comercio. |
| 111 | 111 | Decline. No card record | Número de tarjeta incorrecto. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 116 | 116 | Decline. Not enough money | La suma de la transacción supera el saldo permitido en la cuenta elegida. | Operación rechazada. Compruebe los datos introducidos, el saldo de la tarjeta y repita la operación. |
| 117 | 117 | INCORRECT PIN | Código pin incorrecto (no para transacciones online) | Operación rechazada. Compruebe los datos introducidos, el saldo de la tarjeta y repita la operación. |
| 118 | 118 | No se permite el servicio | Servicio no permitido (rechazo del emisor). | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 119 | 119 | Decline. SECURITY\_VIOLATION | Transacción ilegal. | Operación rechazada. Póngase en |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | contacto con el banco emisor de la tarjeta. |
| 120 | 120 | Decline. Not allowed | Rechazo de la operación, la transacción no está permitida por el emisor. Código de respuesta de la red de pago 57\. Las Causas de denegación hay que preguntarlas al emisor | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 121 | 121 | Decline. Excds wdrwl limt | Se ha intentado realizar una transacción con una cantidad que supera el límite de día indicado por el banco emisor. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 123 | 123 | Decline. Excds wdrwl ltmt | Superado el límite de transacciones: el cliente ha realizado el número máximo de transacciones permitido durante el ciclo limitado e intente realizar una más. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 125 | 125 | Decline. Card declined | Número de tarjeta incorrecto. Este error puede significar varias cosas: intento de reverso de una cantidad mayor, intento de devolver una cantidad cero. Para AmEx el plazo de vigencia de la tarjeta es incorrecto. | Operación rechazada. Compruebe los datos introducidos, el saldo de la tarjeta y repita la operación. |
| 208 | 208 | Decline. Card is lost | Tarjeta perdida. | Operación rechazada. Póngase en contacto con el comercio. |
| 209 | 209 | Decline. Card limitations exceeded | Superados los límites de la tarjeta. | Operación rechazada. |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | Póngase en contacto con el comercio. |
| 400 | 400 | El reversal se ha procesado. | Reversal se ha procesado. | \- |
| 902 | 902 | Decline. Invalid trans | Límites de la tarjeta (El titular de la tarjeta intenta realizar una transacción no permitida). | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 903 | 903 | Decline. Re-enter trans. | Intento de realizar transacción que supera los límites del banco emisor. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 904 | 904 | Decline. Formato error | Formato erróneo del mensaje desde el punto de vista del banco emisor. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 907 | 907 | Decline. Host not avail. | No hay conexión con el banco emisor de la tarjeta. Para este número de tarjeta no está permitida la autorización en stand-in (este régimen significa que el emisor no puede ponerse en contacto con el sistema de pago y por eso la transacción es posible en régimen offline con la descarga en la oficina o la operación será rechazada | No hay conexión con el banco. Vuélvalo a intentar más tarde. |
| 909 | 909 | Decline. Call issuer | Es imposible realizar la operación (error del funcionamiento del Sistema de carácter general. Se indica por | Operación rechazada. Póngase en contacto con el |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  | el Sistema de pago o el banco emisor). | banco emisor de la tarjeta. |
| 910 | 910 | Decline. Host not avail. | El banco emisor no está disponible. | No hay conexión con el banco. Inténtelo más tarde. |
| 913 | 913 | Decline. Invalid trans | Formato de mensaje erróneo (formato de transacción erróneo desde el punto de vista de la red). | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta. |
| 914 | 914 | Decline. Orig trans not found | Transacción no encontrada (cuando se manda la finalización o reversal o refund). | Operación rechazada. Póngase en contacto con el comercio. |
| 999 | 999 | Declined by fraud | No existe el comienzo de la autorización de la transacción. Rechazado por fraude o error 3dsec. | Operación rechazada. Póngase en contacto con el comercio. |
| 1001 | 1001 | Decline. Data input timeout | vacío (Aparece en el momento de registro de la transacción o sea cuando no se han indicado los datos de la tarjeta). | No hay respuesta del banco. Inténtelo más tarde. |
| 1004 | 1004 | Etapa de autorización 1 | Etapa de autorización 1\. | Operación rechazada. Póngase en contacto con el comercio. |
| 1005 | 1005 | Etapa de autorización 2 | Etapa de autorización 2\. | Operación rechazada. Póngase en contacto con el comercio. |
| 2001 | 2001 | Decline. Fraud | Transacción fraudulenta (según el procesamiento o la red de pago). | Operación rechazada. Póngase en contacto con el comercio. |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| ----- | :---- | :---- | :---- | :---- |
| 2002 | 2002 | Operación incorrecta | Operación incorrecta. / | Operación rechazada. Póngase en contacto con el comercio. |
| 2003 | 2003 | Decline. SSL restricted | SSL (No 3d- Secure/SecureCode) de la transacción están prohibidas a el comercio. | Operación rechazada. Póngase en contacto con el comercio. |
| 2004 | 2004 | SSL without CVC forbidden | Pago a través de SSL sin introducir CVС2 está prohibido. | Operación rechazada. Póngase en contacto con el comercio. |
| 2005 | 2005 | 3DS rule failed | El pago no responde a las condiciones de la comprobación por 3ds. | Operación rechazada. Póngase en contacto con el comercio. |
| 2006 | 2006 | Pagos en una etapa estan prohibidos | Los pagos en una etapa están prohibidos. | Operación rechazada. Póngase en contacto con el comercio. |
| 2007 | 2007 | El pedido ya está pagado | El pedido ya está pagado. | Operación rechazada. Póngase en contacto con el comercio. |
| 2008 | 2008 | La transacción aún no ha finalizado | La transacción no ha finalizado. | Operación rechazada. Póngase en contacto con el comercio. |
| 2009 | 2009 | La suma de la anulación supera la suma del pago | La suma de la anulación supera la suma del pago. | Operación rechazada. Póngase en contacto con el comercio. |
| 2014 | 2014 | Error de cumplimiento de la regla 3DS | Error de cumplimiento de la regla 3DS | Operación rechazada. Póngase en |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | contacto con el comercio. |
| 2015 | 2015 | Terminal select rule error | Error de cumplimiento de la regla de elección de la terminal (la regla no es correcta). | Operación rechazada. Póngase en contacto con el comercio. |
| 2016 | 2016 | TDS\_FORBIDDEN | El comerciante no tiene permiso para 3-D Secure, necesario para realizar el pago. | Operación rechazada. Póngase en contacto con el comercio |
| 9001 | 9001 | RBS internal error | Código interno de rechazo de la pasarela de pago. | Operación rechazada. Póngase en contacto con el comercio. |
| 71015 | 1015 | Decline. Input error | Introducidos datos erróneos de la tarjeta. | Operación rechazada. Compruebe los datos introducidos, el saldo de la tarjeta y repita la operación. |
| 151017 | 1017 | Decline. 3DSec comm error | 3-D Secure – error de conexión. | Operación rechazada. Póngase en contacto con el comercio. |
| 151018 | 018 | Decline. Processing timeout | Se acabó el tiempo de procesamiento. No ha sido posible enviarlo. | No hay respuesta del banco. Inténtelo más tarde. |
| 151019 | 1019 | Decline. Processing timeout | Se acabó el tiempo de procesamiento Se acabó el tiempo de procesamiento. Se ha enviado pero no se ha recibido respuesta del banco. | No hay respuesta del banco. Inténtelo más tarde. |
| 341014 | 1014 | Decline. General Error | Código de rechazo de la pasarela de pago. | Operación rechazada. |

| Action code | error\_id | error\_message | Descripción | Mensaje en la página de pago |
| :---- | :---- | :---- | :---- | :---- |
|  |  |  |  | Póngase en contacto con el comercio. |
| \-2016 | \-2016 | Declined. VeRes status is unknown | El banco emisor no ha podido determinar si la tarjeta es 3dsecure. | Operación rechazada. Póngase en contacto con el banco emisor de la tarjeta |

13. # **ANEXO 2\. CÓDIGOS DE INSTITUCIONES FINANCIERAS** {#anexo-2.-códigos-de-instituciones-financieras}

| Código Institución Financiera | Institución Financiera |
| ----- | :---- |
| 1001 | BANCO DE BOGOTA |
| 1002 | BANCO POPULAR |
| 1006 | BANCO ITAU |
| 1007 | BANCOLOMBIA |
| 1009 | CITIBANK |
| 1012 | BANCO GNB SUDAMERIS |
| 1013 | BANCO BBVA COLOMBIA S.A. |
| 1019 | SCOTIABANK COLPATRIA |
| 1023 | BANCO DE OCCIDENTE |
| 1032 | BANCO CAJA SOCIAL |
| 1040 | BANCO AGRARIO |
| 1051 | BANCO DAVIVIENDA |
| 1052 | BANCO AV VILLAS |
| 1058 | BANCO PROCREDIT |
| 1059 | BANCAMIA S.A. |
| 1060 | BANCO PICHINCHA S.A. |
| 1061 | BANCOOMEVA S.A. |
| 1062 | BANCO FALABELLA |
| 1065 | BANCO SANTANDER COLOMBIA |
| 1066 | BANCO COOPERATIVO COOPCENTRAL |
| 1069 | BANCO SERFINANZA |
| 1151 | RAPPIPAY |
| 1283 | CFA COOPERATIVA FINANCIERA |
| 1292 | CONFIAR COOPERATIVA FINANCIERA |
| 1507 | NEQUI |
| 1551 | DAVIPLATA |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAZCAIAAACpVwlNAAAB8UlEQVR4XmP4Txx48uhRko9Qa6bkpEmT0OVwAAZ0AWzg27dvp+ar/T+qD0In9Xfs2IGuAhsgymgNOVaouWBUnSiOrgIbIGz02rVr/59AmAtBdrZW6OowAGGjp5dJopkLRJ/3675+/RpdKSogYLSxsTGmuRDka8uPrhoV4DP648ePX/brYhoKRcf0k5KT0fUgAXxG+9sLIRtkZWUlLcqBbPrxBWroepAATqPVFbiRTbm3Qev7p0/PHz0C2oEsvqFTHl0nDGA3esuWLWhG4DIaiNjY2ND1gwEWo//9+7exWwFNPx6j/5w0ePHiBbopWI1mYWZE04zfaCDSVuJANwXT6KdPn/4/ZYCpGb/RQFRRUYFmFLrRdgYosUe80XfXav79/RvZKBSjq6qqcOkkaDQQaSoJIJuGYvSFxeqYGog3GljUrFu/Hm4awmgjHRl0paQafVS/JVMS3Wh9HVhxjButbJX/sg93voeh7BBhhNGfPn36eVgPUxEa+nxA7x+GIBZ0TN/a2hpqdKIPUlmBA/0+qvfj+/dUYHmEN0Ag6M4mLWC+YwgPjyBG9deDukCjs7OyiFEMRBwcHAxb+5UwJbCi+xu1fhMRbhD0/ZAeA74SmTLEICaEUqVSC00okAJFY1xcnKW+iLWBAFWQjaGwk5MT0FgAQyWXlDxp+AEAAAAASUVORK5CYII=>
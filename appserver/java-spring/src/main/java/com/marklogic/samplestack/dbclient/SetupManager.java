/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.dbclient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.samplestack.MarkLogicUtilities;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.SetupService;


/**
 * Implementation of the RelatedTags service.  
 * This class is an example of client-side support for a MarkLogic REST API
 * Service extension.  The extension name is "relatedTags" and it's implemented 
 * in JavaScript. 
 * <p/>
 * See <a href="http://google.com">http://docs.marklogic.com/guide/rest-dev/extensions</a>
 * See <a href="http://google.com">http://docs.marklogic.com/guide/java/resourceservices</a>
 * <p/>
 * The extension code is at /database/services/relatedTags.sjs
 */
@Component
public class SetupManager extends ResourceManager implements SetupService {

	@Autowired
	private Clients clients;
	
	@Autowired
	private MarkLogicUtilities utilities;
	
	@Autowired
	protected ObjectMapper mapper;

	
	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(SetupManager.class);
	
	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode findContentMetadata(String localname, String type) {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("content-metadata",  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("localname", localname);
		params.add("type", type);
		params.add("mode", "json");
		String[] mimetypes = new String[] { "application/json" };
		
		ServiceResultIterator resultIterator = getServices().get(params, mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}

	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode findIndexes() {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("range-indexes",  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("mode", "json");
		String[] mimetypes = new String[] { "application/json" };
		
		ServiceResultIterator resultIterator = getServices().get(params, mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}

	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode setIndexes(ObjectNode indexes) {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("range-indexes",  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("mode", "json");
		String[] mimetypes = new String[] { "application/json" };
		
		ServiceResultIterator resultIterator = getServices().post(params, new JacksonHandle(indexes), mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}

	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode findFields() {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("fields",  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("mode", "json");
		String[] mimetypes = new String[] { "application/json" };
		
		ServiceResultIterator resultIterator = getServices().get(params, mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}

	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode setFields(ObjectNode fields) {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("fields",  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("mode", "json");
		String[] mimetypes = new String[] { "application/json" };
		ServiceResultIterator resultIterator = getServices().post(params, new JacksonHandle(fields), mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}
	
	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode findSearchOptions() {
		return utilities.getSearchOptions("all");
	}

	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public ObjectNode setSearchOptions(ObjectNode searchOptions) {
		QueryOptionsManager optsManager = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).newServerConfigManager().newQueryOptionsManager();  // is this expensive?
		JacksonHandle responseHandle = new JacksonHandle(searchOptions);
		optsManager.writeOptions("all", responseHandle);
		return searchOptions;
	}

	/**
	 * Loads data
	 * @param directory to load into DB.
	 * @return ObjectNode
	 */
	public ObjectNode loadData(String directory) {
		ObjectNode docNode = mapper.createObjectNode();
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init("load-data",  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("directory", directory);
		String[] mimetypes = new String[] { "application/json" };
		
		ServiceResultIterator resultIterator = getServices().post(params, new JacksonHandle(docNode), mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}
	
	/**
	 * Gets chart data from the server.
	 * @return ObjectNode
	 */
	public ObjectNode findChartData() {
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).newJSONDocumentManager(); 
		JacksonHandle responseHandle = new JacksonHandle();
		docMgr.read("/config/charts.json", responseHandle);
		return (ObjectNode) responseHandle.get();
	}

	/**
	 * Sets chart data in database.
	 * @param chartData An input tag to check for related tags.
	 * @return ObjectNode.
	 */
	public ObjectNode setChartData(ObjectNode chartData) {
		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).newJSONDocumentManager(); 
		docMgr.write("/config/charts.json", new JacksonHandle(chartData));
		return chartData;
	}
}

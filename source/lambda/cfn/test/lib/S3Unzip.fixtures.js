/*********************************************************************************************************************
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.                                                *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/                                                                               *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

exports.s3GetObjectCommand = function() {
    const response = {
        DstBucket: 'mock_bucket',
        Key: 'mock_key',
        SrcBucket: 'mock_source_bucket'
    }

    return response;
}

exports.s3BucketObject = function() {
    const response = {
        Bucket: 'mock_bucket',
        Key: 'mock_key',
        ContentType: 'mock_type'
    }

    return response;
}

exports.jsZipSpyObject = function() {
    const response = {
        files: {
            file: {
                key: 'mock_key',
                path: 'mock_path'
            }
        }
    }

    return response;
}
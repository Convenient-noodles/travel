package com.example.tourism.config;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;
import java.nio.charset.StandardCharsets;

/**
 * 【改】自定义TypeHandler，将数据库BLOB类型转为Java String
 */
@MappedJdbcTypes(JdbcType.BLOB)
@MappedTypes(String.class)
public class BlobToStringTypeHandler extends BaseTypeHandler<String> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter);
    }

    @Override
    public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
        Blob blob = rs.getBlob(columnName);
        if (blob == null) {
            return null;
        }
        byte[] bytes = blob.getBytes(1, (int) blob.length());
        return new String(bytes, StandardCharsets.UTF_8);
    }

    @Override
    public String getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        Blob blob = rs.getBlob(columnIndex);
        if (blob == null) {
            return null;
        }
        byte[] bytes = blob.getBytes(1, (int) blob.length());
        return new String(bytes, StandardCharsets.UTF_8);
    }

    @Override
    public String getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        Blob blob = cs.getBlob(columnIndex);
        if (blob == null) {
            return null;
        }
        byte[] bytes = blob.getBytes(1, (int) blob.length());
        return new String(bytes, StandardCharsets.UTF_8);
    }
}
